import { ethers } from 'ethers';
import { sendEmail } from './email.service';
import { sendDiscordNotification } from './discord.service';
import { sendWebhookNotification } from './webhook.service';
import { workflowStore, userStore } from '../store';
import { broadcastUpdate } from '..';
import axios from 'axios';

let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider;

export const verifyTransaction = async (txHash: string, expectedTo: string, expectedValueEth: string): Promise<boolean> => {
  try {
    if (!provider) {
      console.error("Provider not initialized");
      return false;
    }
    
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      console.log(`Transaction not found: ${txHash}`);
      return false;
    }

    const txReceipt = await tx.wait();

    if (txReceipt && txReceipt.status === 1) {
      const isToAddressCorrect = tx.to?.toLowerCase() === expectedTo.toLowerCase();
      const sentValue = ethers.formatEther(tx.value);
      const isValueCorrect = sentValue === expectedValueEth;

      if (isToAddressCorrect && isValueCorrect) {
        console.log(`Transaction ${txHash} successfully verified.`);
        return true;
      } else {
        console.log(`Transaction ${txHash} verification failed. To: ${isToAddressCorrect}, Value: ${isValueCorrect}`);
        return false;
      }
    } else {
      console.log(`Transaction ${txHash} failed or is still pending.`);
      return false;
    }
  } catch (error) {
    console.error(`Error verifying transaction ${txHash}:`, error);
    return false;
  }
};

export const initializeProvider = () => {
  const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';
  console.log(`Initializing provider and connecting to ${rpcUrl}...`);

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);

    provider.on('block', async (blockNumber) => {
      console.log(`[Block: ${blockNumber}] New block received from node.`);
      
      const allWorkflows = workflowStore.getAll();
      if (allWorkflows.length === 0) return;

      try {
        const block = await provider.getBlock(blockNumber);
        if (block && block.transactions) {
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            if (tx && tx.to) {
              const toAddress = tx.to.toLowerCase();
              const matchedWorkflows = allWorkflows.filter(
                (w) => w.isActive && w.sourceAddress.toLowerCase() === toAddress
              );
              for (const workflow of matchedWorkflows) {
                handleMatchedWorkflow(workflow, tx);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing block ${blockNumber}:`, error);
      }
    });

    console.log('Successfully connected to local Hardhat node. Listening for new blocks.');

  } catch (error) {
    console.error('Failed to connect to local Hardhat node:', error);
  }
};

const parseMessage = (message: string, context: any): string => {
  return message.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const keys = key.trim().split('.');
    let value = context;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return ''; // Return empty string if key not found
      }
    }
    return value;
  });
};

const sendCustomNotification = async (rule: any, workflow: any, context: any, user: any) => {
  const message = parseMessage(rule.message, context);

  if (rule.action === 'sendDiscord') {
    const webhookUrl = user.settings?.integrations?.discord || workflow.actionParams?.discordWebhook;
    if (webhookUrl) {
      const payload = { content: message };
      await sendDiscordNotification(webhookUrl, payload);
    } else {
      console.error(`[Web3Flow] Custom notification for workflow "${workflow.name}" failed: No Discord webhook URL found in user settings or workflow parameters.`);
    }
  } else if (rule.action === 'sendEmail') {
    const email = user.settings?.integrations?.email || workflow.actionParams?.email;
    if (email) {
      const subject = `Notification for ${workflow.name}`;
      await sendEmail(email, subject, message);
    } else {
      console.error(`[Web3Flow] Custom notification for workflow "${workflow.name}" failed: No email address found in user settings or workflow parameters.`);
    }
  }
};

const handleWorkflowFailure = async (workflow: any, error: any) => {
  console.error(`!!! Workflow "${workflow.name}" failed:`, error.message);

  const user = workflow.userAddress ? userStore.findOrCreateUser(workflow.userAddress) : null;

  // --- Custom Notification Rule Logic ---
  if (workflow.notificationRuleId && user) {
    const rule = user.notificationRules.find(r => r.id === workflow.notificationRuleId);
    if (rule && rule.trigger === 'workflowFails') {
      console.log(`Executing custom "failure" notification rule: "${rule.name}"`);
      await sendCustomNotification(rule, workflow, { workflow, error }, user);
      return; // Custom rule executed, skip default
    }
  }
  // --- Fallback to Default Notification ---
  if (!user || !user.settings?.notifications?.failureAlerts) {
    console.log(`Failure alerts disabled for ${workflow.userAddress || 'this user'}.`);
    return;
  }

  const { settings } = user;
  const failureMessage = `Your workflow "${workflow.name}" failed to execute.`;
  const errorDetails = `Error: ${error.message}`;

  // Send Discord notification
  if (settings.notifications?.discord && settings.integrations?.discord) {
    const discordPayload = {
      embeds: [{
        title: `🚨 Workflow Failure: ${workflow.name}`,
        color: 15548997, // Red
        fields: [
          { name: 'Message', value: failureMessage, inline: false },
          { name: 'Details', value: `\`\`\`${errorDetails}\`\`\``, inline: false },
        ],
        footer: { text: 'Powered by Web3Flow (Localnet)' },
        timestamp: new Date().toISOString(),
      }]
    };
    try {
      await sendDiscordNotification(settings.integrations.discord, discordPayload);
    } catch (e) {
      console.error('Failed to send failure notification to Discord:', e);
    }
  }

  // Send Email notification
  if (settings.notifications?.email && settings.integrations?.email) {
    try {
      const subject = `Workflow Failure: ${workflow.name}`;
      const text = `${failureMessage}\n${errorDetails}`;
      await sendEmail(settings.integrations.email, subject, text);
    } catch (e) {
      console.error('Failed to send failure notification to Email:', e);
    }
  }

  // Send Webhook notification
  if (settings.notifications?.webhook && settings.integrations?.webhookUrl) {
    const webhookPayload = {
      workflowName: workflow.name,
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    try {
      await sendWebhookNotification(settings.integrations.webhookUrl, webhookPayload);
    } catch (e) {
      console.error('Failed to send failure notification to Webhook:', e);
    }
  }
};

const handleMatchedWorkflow = async (workflow: any, tx: ethers.TransactionResponse) => {
  const startTime = Date.now();
  try {
    console.log(`!!! Matched workflow "${workflow.name}" for a transaction to ${tx.to} !!!`);

    // Increment the execution count (now with response time)
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    workflowStore.incrementExecutionCount(workflow.id, responseTimeMs);

    // Update total executions for the user
    const user = workflow.userAddress ? userStore.findOrCreateUser(workflow.userAddress) : null;
    if (user) {
      const userWorkflows = workflowStore.getAll().filter(w => w.userAddress?.toLowerCase() === user.address.toLowerCase());
      const totalExecutions = userWorkflows.reduce((sum, w) => sum + w.executionCount, 0);
      userStore.updateUsage(user.address, { executions: totalExecutions });
    }

    // Get the updated workflow from the store to ensure we have the latest data
    const updatedWorkflow = workflowStore.findById(workflow.id);

    // Broadcast the execution update to all connected clients first
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

    // --- Custom Notification Rule Logic ---
    if (workflow.notificationRuleId && user) {
      const rule = user.notificationRules.find(r => r.id === workflow.notificationRuleId);
      if (rule && rule.trigger === 'workflowSucceeds') {
        console.log(`Executing custom "success" notification rule: "${rule.name}"`);
        const context = {
          user_name: user?.settings?.profile?.name || user?.address || 'User',
          trigger_data: workflow.triggerType === 'eth_transfer' ? 'ETH Transfer' : (workflow.triggerType === 'nft_purchase' ? 'NFT Purchase' : (workflow.triggerType === 'contract_event' ? 'Contract Event' : '')), 
          timestamp: new Date().toLocaleString(),
          workflow_name: workflow.name,
          amount: tx.value ? ethers.formatEther(tx.value) : '',
          address: tx.to || '',
          tx_hash: tx.hash || '',
          workflow,
          tx: { ...tx.toJSON(), value: ethers.formatEther(tx.value) }
        };
        await sendCustomNotification(rule, workflow, context, user);
        return; // Stop here to prevent default notification
      } else if (!rule) {
        console.log(`[Web3Flow] A notificationRuleId ("${workflow.notificationRuleId}") was found on workflow "${workflow.name}", but a matching rule was not found for user ${user.address}. This can happen if the server was restarted. Using default notification.`);
      }
    }
    // --- End Custom Notification Logic ---

    const settings = user?.settings;

    // Check if execution alerts are enabled for the user
    if (!settings?.notifications?.executionAlerts) {
      console.log(`Execution alerts are disabled for ${workflow.userAddress}. Skipping notification.`);
      return;
    }

    if (workflow.actionType === 'discord') {
      // Check if Discord notifications are enabled
      if (!settings?.notifications?.discord) {
        console.log(`Discord notifications are disabled for ${workflow.userAddress}. Skipping.`);
        return;
      }

      const webhookUrl = settings.integrations?.discord || workflow.actionParams?.discordWebhook;
      if (!webhookUrl) {
        throw new Error('No Discord webhook URL found for workflow or user integrations.');
      }

      // If workflow.message.body exists, use it as the notification content
      if (workflow.message && workflow.message.body) {
        const context = {
          user_name: user?.settings?.profile?.name || user?.address || 'User',
          trigger_data: workflow.triggerType === 'eth_transfer' ? 'ETH Transfer' : (workflow.triggerType === 'nft_purchase' ? 'NFT Purchase' : (workflow.triggerType === 'contract_event' ? 'Contract Event' : '')),
          timestamp: new Date().toLocaleString(),
          workflow_name: workflow.name,
          amount: tx.value ? ethers.formatEther(tx.value) : '',
          address: tx.to || '',
          tx_hash: tx.hash || '',
          workflow,
          tx: { ...tx.toJSON(), value: ethers.formatEther(tx.value) }
        };
        const parsedMessage = parseMessage(workflow.message.body, context);
        await sendDiscordNotification(webhookUrl, { content: parsedMessage });
      } else {
        const discordMessage = {
          embeds: [
            {
              title: `🔔 Localhost Transfer Detected: ${workflow.name}`,
              color: 16776960, // Yellow for localhost
              fields: [
                { name: 'To', value: `\`${tx.to}\``, inline: false },
                { name: 'From', value: `\`${tx.from}\``, inline: false },
                { name: 'Amount', value: `**${ethers.formatEther(tx.value)} ETH**`, inline: true },
                { name: 'Transaction Hash', value: `\`${tx.hash}\``, inline: false },
              ],
              footer: { text: 'Powered by Web3Flow (Localnet)' },
              timestamp: new Date().toISOString(),
            }
          ]
        };
        await sendDiscordNotification(webhookUrl, discordMessage);
      }
    }
  } catch (error) {
    await handleWorkflowFailure(workflow, error);
  }
};

// This function doesn't need to do anything for a local node setup,
// as the block listener handles everything.
export const addWorkflowToWatcher = (workflow: any) => {
  console.log(`Workflow "${workflow.name}" for address ${workflow.sourceAddress} has been added. The local block listener will check for its transactions.`);
};

/**
 * Fetches real-time prices for the given symbols from Binance public API.
 * @param symbols Array of token symbols, e.g. ['ETH', 'BTC']
 * @returns Object keyed by symbol, each containing price and percentChange24h
 */
export async function getTokenPricesFromBinance(symbols: string[]) {
  // Binance uses symbols like ETHUSDT, BTCUSDT, etc.
  const symbolMap: Record<string, string> = {
    ETH: 'ETHUSDT',
    BTC: 'BTCUSDT',
    PEPE: 'PEPEUSDT',
    LINK: 'LINKUSDT',
  };
  const results: Record<string, any> = {};
  for (const symbol of symbols) {
    const binanceSymbol = symbolMap[symbol];
    if (!binanceSymbol) continue;
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`;
    try {
      const { data } = await axios.get(url);
      results[symbol] = {
        price: data.lastPrice,
        percentChange24h: data.priceChangePercent,
        priceChange24h: data.priceChange
      };
    } catch (e) {
      results[symbol] = {
        price: 0,
        percentChange24h: 0,
        priceChange24h: 0
      };
    }
  }
  return results;
} 