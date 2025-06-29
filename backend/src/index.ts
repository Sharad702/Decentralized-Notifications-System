import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { initializeProvider, addWorkflowToWatcher, verifyTransaction } from './services/blockchain.service';
import { workflowStore, userStore, templateStore } from './store';

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

server.listen(PORT, () => {
  console.log(`Backend server with WebSocket is running on http://localhost:${PORT}`);
  
  // Initialize the blockchain provider and start listening
  initializeProvider();

  // Add all existing workflows to the watcher on startup
  for (const workflow of workflowStore.getAll()) {
    addWorkflowToWatcher(workflow);
  }
}); 