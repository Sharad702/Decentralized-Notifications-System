import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { initializeProvider, addWorkflowToWatcher, verifyTransaction, getTokenPricesFromBinance } from './services/blockchain.service';
import { workflowStore, userStore, templateStore, alertStore, portfolioStore } from './store';
import { sendDiscordNotification } from './services/discord.service';
import alertRouter from './routes/alert.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Middleware to count API calls
const countApiCall = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let userAddress: string | undefined;

  // Check for API Key in Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    const user = userStore.findByApiKey(apiKey);
    if (user) {
      userAddress = user.address;
    }
  }

  // Fallback to checking params, query, or body
  if (!userAddress) {
    if (req.params.address) {
      userAddress = req.params.address;
    } else if (req.query.userAddress) {
      userAddress = req.query.userAddress as string;
    } else if (req.body.userAddress) {
      userAddress = req.body.userAddress;
    }
  }

  if (userAddress) {
    userStore.incrementApiCall(userAddress);
  }
  next();
};

// Setup WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

export const broadcastUpdate = (message: object) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

app.use(cors());
app.use(express.json());

// Apply middleware to all /api routes
app.use('/api', countApiCall);

// USER SETTINGS ROUTES
app.get('/api/users/:address/settings', (req, res) => {
  const { address } = req.params;
  const settings = userStore.getSettings(address);
  if (settings) {
    res.json(settings);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/users/:address/settings', (req, res) => {
  const { address } = req.params;
  const newSettings = req.body;
  const updatedUser = userStore.updateSettings(address, newSettings);
  res.json(updatedUser.settings);
});

app.get('/api/users/:address/api-key', (req, res) => {
  const { address } = req.params;
  const user = userStore.findOrCreateUser(address);
  res.json({ apiKey: user.apiKey });
});

app.post('/api/users/:address/regenerate-api-key', (req, res) => {
  const { address } = req.params;
  const user = userStore.regenerateApiKey(address);
  if (user) {
    res.json({ apiKey: user.apiKey });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/api/users/:address/usage', (req, res) => {
  const { address } = req.params;
  const user = userStore.findOrCreateUser(address);
  res.json({
    ...user.usage,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
  });
});

app.post('/api/users/:address/upgrade-plan', async (req, res) => {
  const { address } = req.params;
  const { planId, txHash, priceInEth } = req.body;

  if (!planId || !txHash || !priceInEth) {
    return res.status(400).json({ message: 'planId, txHash, and priceInEth are required.' });
  }

  // This is the address that you provided for payments.
  const paymentAddress = '0xcd3B766CCDd6AE721141F452C550Ca635964ce71';

  const isVerified = await verifyTransaction(txHash, paymentAddress, priceInEth);

  if (isVerified) {
    const updatedUser = userStore.upgradePlan(address, planId);
    if (updatedUser) {
      res.json({ message: 'Plan upgraded successfully', user: updatedUser });
    } else {
      // This case should ideally not happen if findOrCreateUser works
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(400).json({ message: 'Transaction verification failed. Could not upgrade plan.' });
  }
});

// NOTIFICATION RULE ROUTES
app.get('/api/users/:address/rules', (req, res) => {
  const { address } = req.params;
  const rules = userStore.getRules(address);
  res.json(rules);
});

app.post('/api/users/:address/rules', (req, res) => {
  const { address } = req.params;
  const ruleData = req.body;
  const newRule = userStore.addRule(address, ruleData);
  res.status(201).json(newRule);
});

app.put('/api/users/:address/rules/:ruleId', (req, res) => {
  const { address, ruleId } = req.params;
  const updates = req.body;
  const updatedRule = userStore.updateRule(address, ruleId, updates);
  if (updatedRule) {
    res.json(updatedRule);
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

app.delete('/api/users/:address/rules/:ruleId', (req, res) => {
  const { address, ruleId } = req.params;
  const success = userStore.deleteRule(address, ruleId);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

// WORKFLOW ROUTES

// API to get all workflows for a specific user
app.get('/api/workflows', (req, res) => {
  const userAddress = req.query.userAddress as string;
  if (!userAddress) {
    return res.status(400).json({ message: 'userAddress query parameter is required' });
  }
  const workflows = workflowStore.getAll().filter(w => w.userAddress?.toLowerCase() === userAddress.toLowerCase());
  res.json(workflows);
});

// API to create a new workflow
app.post('/api/workflows', (req, res) => {
  const { userAddress, ...workflowData } = req.body;
  if (!userAddress) {
    return res.status(400).json({ message: 'userAddress is required to create a workflow' });
  }
  const newWorkflow = { ...workflowData, id: Date.now().toString(), userAddress };
  workflowStore.add(newWorkflow);
  
  // Update user's workflow count
  const userWorkflows = workflowStore.getAll().filter(w => w.userAddress?.toLowerCase() === userAddress.toLowerCase());
  userStore.updateUsage(userAddress, { workflows: userWorkflows.length });

  console.log('New workflow created:', newWorkflow);
  
  // Start watching based on the new workflow
  addWorkflowToWatcher(newWorkflow);

  res.status(201).json(newWorkflow);
});

// API to toggle a workflow's status
app.patch('/api/workflows/:id/toggle', (req, res) => {
  const { id } = req.params;
  const updatedWorkflow = workflowStore.toggleStatus(id);

  if (updatedWorkflow) {
    broadcastUpdate({
      type: 'WORKFLOW_TOGGLED',
      payload: updatedWorkflow,
    });
    res.json(updatedWorkflow);
  } else {
    res.status(404).json({ message: 'Workflow not found' });
  }
});

// API to delete a workflow
app.delete('/api/workflows/:id', (req, res) => {
  const { id } = req.params;
  const deletedWorkflow = workflowStore.delete(id);

  if (deletedWorkflow && deletedWorkflow.userAddress) {
    const userAddress = deletedWorkflow.userAddress;
    const userWorkflows = workflowStore.getAll().filter(w => w.userAddress?.toLowerCase() === userAddress.toLowerCase());
    userStore.updateUsage(userAddress, { workflows: userWorkflows.length });

    broadcastUpdate({
      type: 'WORKFLOW_DELETED',
      payload: { workflowId: id },
    });
    res.status(204).send(); // 204 No Content for successful deletion
  } else if (deletedWorkflow) {
    // Handle case where workflow has no user address (optional)
    broadcastUpdate({
      type: 'WORKFLOW_DELETED',
      payload: { workflowId: id },
    });
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Workflow not found' });
  }
});

// API to update a workflow
app.patch('/api/workflows/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedWorkflow = workflowStore.update(id, updates);

  if (updatedWorkflow) {
    broadcastUpdate({
      type: 'WORKFLOW_UPDATED',
      payload: updatedWorkflow,
    });
    res.json(updatedWorkflow);
  } else {
    res.status(404).json({ message: 'Workflow not found' });
  }
});

// TEMPLATE ROUTES

// Get all templates for a user
app.get('/api/templates', (req, res) => {
  const { userAddress } = req.query;
  if (!userAddress) {
    return res.status(400).json({ message: 'userAddress query parameter is required' });
  }
  const userTemplates = templateStore.getAll().filter(t => t.userAddress.toLowerCase() === (userAddress as string).toLowerCase());
  res.json(userTemplates);
});

// Create a new template
app.post('/api/templates', (req, res) => {
  const { userAddress, ...templateData } = req.body;
  if (!userAddress) {
    return res.status(400).json({ message: 'userAddress is required to create a template' });
  }
  const newTemplate = templateStore.add({ ...templateData, userAddress });
  res.status(201).json(newTemplate);
});

// Update a template
app.put('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // Ensure userAddress is not changed
  delete updates.userAddress;

  // Atomic increment support
  if (updates.usageCount === 'increment') {
    const template = templateStore.findById(id);
    if (template) {
      updates.usageCount = (template.usageCount || 0) + 1;
    }
  }

  const updatedTemplate = templateStore.update(id, updates);
  if (updatedTemplate) {
    res.json(updatedTemplate);
  } else {
    res.status(404).json({ message: 'Template not found' });
  }
});

// Delete a template
app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const deleted = templateStore.delete(id);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Template not found' });
  }
});

// Portfolio API endpoint for real-time prices
app.get('/api/portfolio', async (req, res) => {
  try {
    const symbols = ['ETH', 'BTC', 'PEPE', 'LINK'];
    const prices = await getTokenPricesFromBinance(symbols);

    // Use the in-memory portfolio store
    const portfolio = portfolioStore.get();

    // Calculate value using prices and add 24h change fields
    const portfolioWithValues = portfolio.map(asset => {
      const price = Number(prices[asset.symbol]?.price) || 0;
      const percentChange24h = Number(prices[asset.symbol]?.percentChange24h) || 0;
      const priceChange24h = Number(prices[asset.symbol]?.priceChange24h) || 0;
      return {
        ...asset,
        price: price.toFixed(6),
        value: (asset.amount * price).toFixed(2),
        percentChange24h: percentChange24h.toFixed(2),
        priceChange24h: priceChange24h.toFixed(2)
      };
    });

    res.json({ portfolio: portfolioWithValues, prices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// PORTFOLIO ALERT ROUTES
app.use('/api/alerts', alertRouter);

// Test endpoint to trigger an alert and send notification
app.post('/api/alerts/:id/trigger', async (req, res) => {
  const { id } = req.params;
  const alert = alertStore.findById(id);
  if (!alert) {
    return res.status(404).json({ message: 'Alert not found' });
  }
  // Simulate sending notification (Discord only for now)
  if (alert.actionType === 'discord' && alert.actionParams?.discordWebhook) {
    try {
      await sendDiscordNotification(alert.actionParams.discordWebhook, {
        content: `Test alert triggered: ${alert.name}\n${alert.description}`
      });
      console.log(`Sent Discord notification for alert ${alert.id}`);
      return res.json({ message: 'Discord notification sent' });
    } catch (e) {
      console.error('Failed to send Discord notification:', e);
      return res.status(500).json({ message: 'Failed to send Discord notification' });
    }
  }
  res.json({ message: 'No notification sent (actionType not supported or missing webhook)' });
});

// Analytics endpoint for average response time
app.get('/api/analytics/response-time', (req, res) => {
  const workflows = workflowStore.getAll();
  let total = 0;
  let count = 0;
  workflows.forEach(wf => {
    if (wf.responseTimes && wf.responseTimes.length > 0) {
      total += wf.responseTimes.reduce((a, b) => a + b, 0);
      count += wf.responseTimes.length;
    }
  });
  const avgMs = count > 0 ? total / count : 0;
  res.json({ averageResponseTimeMs: avgMs, averageResponseTimeS: avgMs / 1000 });
});

// Automatic portfolio alert checker (runs every minute)
setInterval(async () => {
  const alerts = alertStore.getAll().filter(a => a.status === 'active');
  if (alerts.length === 0) return;
  const symbols = ['ETH', 'BTC', 'PEPE', 'LINK'];
  const prices = await getTokenPricesFromBinance(symbols);
  // Use the in-memory portfolio store
  const portfolio = portfolioStore.get();
  const totalValue = portfolio.reduce((sum, asset) => {
    const price = Number(prices[asset.symbol]?.price) || 0;
    return sum + asset.amount * price;
  }, 0);
  for (const alert of alerts) {
    if (alert.type === 'portfolio_value' && alert.threshold) {
      if (alert.threshold.includes('%') && alert.initialValue) {
        // Percentage-based alert
        const percentThreshold = parseFloat(alert.threshold.replace(/[^0-9.\-]/g, ''));
        const percentChange = ((totalValue - alert.initialValue) / alert.initialValue) * 100;
        if (Math.abs(percentChange) >= Math.abs(percentThreshold)) {
          if (alert.actionType === 'discord' && alert.actionParams?.discordWebhook) {
            await sendDiscordNotification(alert.actionParams.discordWebhook, {
              content: `Portfolio value changed by ${percentChange.toFixed(2)}% (threshold: ${percentThreshold}%)\nCurrent: $${totalValue.toFixed(2)} | Initial: $${alert.initialValue.toFixed(2)}`
            });
            console.log(`Automatic Discord % alert sent for alert ${alert.id}`);
          }
          // Instead of setting status: 'triggered', just update lastTriggered
          alertStore.update(alert.id, { lastTriggered: new Date().toISOString() });
          // Increment execution count for all workflows linked to this alert
          const workflowsToUpdate = workflowStore.getAll().filter(w => w.portfolioAlertId === alert.id);
          for (const workflow of workflowsToUpdate) {
            workflowStore.incrementExecutionCount(workflow.id);
            // Optionally update user usage
            if (workflow.userAddress && typeof workflow.userAddress === 'string') {
              const userWorkflows = workflowStore.getAll().filter(w => w.userAddress?.toLowerCase() === workflow.userAddress!.toLowerCase());
              userStore.updateUsage(workflow.userAddress, { executions: userWorkflows.reduce((sum, w) => sum + w.executionCount, 0) });
            }
            // Broadcast workflow execution update to all clients
            const updatedWorkflow = workflowStore.findById(workflow.id);
            if (updatedWorkflow) {
              broadcastUpdate({
                type: 'WORKFLOW_EXECUTED',
                payload: {
                  workflowId: updatedWorkflow.id,
                  executionCount: updatedWorkflow.executionCount,
                  lastTriggered: updatedWorkflow.lastTriggered,
                }
              });
            }
          }
        }
      } else {
        // Dollar-based alert (legacy)
        const thresholdValue = parseFloat(alert.threshold.replace(/[^0-9.]/g, ''));
        if (totalValue >= thresholdValue) {
          if (alert.actionType === 'discord' && alert.actionParams?.discordWebhook) {
            await sendDiscordNotification(alert.actionParams.discordWebhook, {
              content: `Portfolio value alert: $${totalValue.toFixed(2)} (threshold: $${thresholdValue})`
            });
            console.log(`Automatic Discord alert sent for alert ${alert.id}`);
          }
          // Instead of setting status: 'triggered', just update lastTriggered
          alertStore.update(alert.id, { lastTriggered: new Date().toISOString() });
        }
      }
    }
    // Add more alert types as needed...
  }
}, 60000); // Every 60 seconds

server.listen(PORT, () => {
  console.log(`Backend server with WebSocket is running on http://localhost:${PORT}`);
  
  // Initialize the blockchain provider and start listening
  initializeProvider();

  // Add all existing workflows to the watcher on startup
  for (const workflow of workflowStore.getAll()) {
    addWorkflowToWatcher(workflow);
  }
}); 

export default app; 