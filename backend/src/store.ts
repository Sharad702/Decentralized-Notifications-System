import { randomBytes } from 'crypto';
// A simple in-memory data store for our workflows.
// In a real application, this would be replaced by a database connection.

export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event' | 'portfolio_alert';
  actionType: 'email' | 'webhook' | 'discord';
  sourceAddress: string;
  userAddress?: string;
  actionParams: {
    email?: string;
    webhookUrl?: string;
    discordWebhook?: string;
  };
  isActive: boolean;
  executionCount: number;
  successRate: number;
  createdAt: string;
  lastTriggered?: string;
  previousExecutionCount?: number;
  notificationRuleId?: string;
  executionTimestamps?: string[];
  portfolioAlertId?: string; // Link to alert
  responseTimes?: number[];
}

const workflows: Workflow[] = [];

export const workflowStore = {
  getAll: () => workflows,
  add: (workflow: Workflow) => {
    workflows.push(workflow);
  },
  findById: (id: string) => workflows.find(w => w.id === id),
  incrementExecutionCount: (id: string, responseTimeMs?: number) => {
    const workflow = workflowStore.findById(id);
    if (workflow) {
      if (workflow.previousExecutionCount === undefined) {
        workflow.previousExecutionCount = workflow.executionCount;
      }
      if (typeof workflow.executionCount !== 'number' || isNaN(workflow.executionCount)) {
        workflow.executionCount = 0;
      }
      workflow.executionCount++;
      workflow.successRate = 100;
      workflow.lastTriggered = new Date().toISOString();
      if (!workflow.executionTimestamps) workflow.executionTimestamps = [];
      workflow.executionTimestamps.push(new Date().toISOString());
      if (responseTimeMs !== undefined) {
        if (!workflow.responseTimes) workflow.responseTimes = [];
        workflow.responseTimes.push(responseTimeMs);
      }
      console.log(`Incremented execution count for workflow "${workflow.name}" to ${workflow.executionCount}.`);
    }
  },
  toggleStatus: (id: string) => {
    const workflow = workflowStore.findById(id);
    if (workflow) {
      workflow.isActive = !workflow.isActive;
      console.log(`Toggled status for workflow "${workflow.name}" to isActive: ${workflow.isActive}.`);
      return workflow;
    }
    return undefined;
  },
  delete: (id: string) => {
    const index = workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      const deletedWorkflow = workflows.splice(index, 1)[0];
      console.log(`Deleted workflow "${deletedWorkflow.name}".`);
      return deletedWorkflow;
    }
    return undefined;
  },
  update: (id: string, updates: Partial<Workflow>) => {
    const workflow = workflowStore.findById(id);
    if (workflow) {
      Object.assign(workflow, updates);
      console.log(`Updated workflow "${workflow.name}".`);
      return workflow;
    }
    return undefined;
  },
};

export interface PortfolioAlert {
  id: string;
  name: string;
  type: string;
  description: string;
  threshold: string;
  currentValue: string;
  targetValue: string;
  status: 'active' | 'paused' | 'triggered';
  lastTriggered: string;
  actionType?: string;
  actionParams?: {
    email?: string;
    webhookUrl?: string;
    discordWebhook?: string;
    telegramBot?: string;
    telegramChat?: string;
  };
  initialValue?: number; // Baseline for % alerts
}

const portfolioAlerts: PortfolioAlert[] = [];

export const alertStore = {
  getAll: () => portfolioAlerts,
  add: (alert: Omit<PortfolioAlert, 'id'>) => {
    const newAlert: PortfolioAlert = {
      ...alert,
      id: randomBytes(8).toString('hex'),
    };
    portfolioAlerts.push(newAlert);
    return newAlert;
  },
  update: (id: string, updates: Partial<PortfolioAlert>) => {
    const alert = portfolioAlerts.find(a => a.id === id);
    if (alert) {
      Object.assign(alert, updates);
      return alert;
    }
    return undefined;
  },
  delete: (id: string) => {
    const idx = portfolioAlerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      return portfolioAlerts.splice(idx, 1)[0];
    }
    return undefined;
  },
  findById: (id: string) => portfolioAlerts.find(a => a.id === id),
};

export interface Template {
  id: string;
  userAddress: string;
  name: string;
  description: string;
  category: 'defi' | 'nft' | 'gaming' | 'dao' | 'custom';
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event' | 'token_transfer' | 'price_alert';
  actionType: 'email' | 'webhook' | 'discord' | 'slack' | 'telegram';
  isPublic: boolean;
  isPremium: boolean;
  tags: string[];
  message: {
    subject: string;
    body: string;
  };
  config: {
    triggerConfig: Record<string, any>;
    actionConfig: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const templates: Template[] = [];

export const templateStore = {
  getAll: () => templates,
  add: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: Template = {
      ...template,
      id: randomBytes(16).toString('hex'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: typeof template.usageCount === 'number' ? template.usageCount : 0,
    };
    templates.push(newTemplate);
    return newTemplate;
  },
  findById: (id: string) => templates.find(t => t.id === id),
  update: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt' | 'userAddress'>>) => {
    const template = templateStore.findById(id);
    if (template) {
      console.log('Before update:', JSON.stringify(template));
      if (updates.usageCount !== undefined) {
        template.usageCount = Number(updates.usageCount);
        if (isNaN(template.usageCount)) template.usageCount = 0;
        delete updates.usageCount;
      }
      Object.assign(template, updates);
      template.updatedAt = new Date().toISOString();
      console.log('After update:', JSON.stringify(template));
      return template;
    }
    return undefined;
  },
  delete: (id: string) => {
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = templates.splice(index, 1);
      return deleted[0];
    }
    return undefined;
  },
};

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'workflowSucceeds' | 'workflowFails';
  action: 'sendDiscord' | 'sendEmail';
  message: string; // Template with variables
}

// Simple in-memory store for user settings
interface UserSettings {
  notifications?: {
    email?: boolean;
    discord?: boolean;
    webhook?: boolean;
    executionAlerts?: boolean;
    failureAlerts?: boolean;
    weeklyReports?: boolean;
  };
  integrations?: {
    discord?: string;
    email?: string;
    webhookUrl?: string;
  };
  profile?: {
    name?: string;
  };
}

interface User {
  address: string;
  settings: Partial<UserSettings>;
  apiKey: string;
  plan: 'free' | 'monthly' | 'bimonthly';
  planExpiresAt?: string;
  notificationRules: NotificationRule[];
  usage: {
    executions: number;
    workflows: number;
    apiCalls: number;
  };
}

const users: User[] = [];

export const userStore = {
  findOrCreateUser: (address: string): User => {
    let user = users.find(u => u.address.toLowerCase() === address.toLowerCase());
    if (!user) {
      user = {
        address,
        apiKey: randomBytes(24).toString('hex'),
        plan: 'free',
        settings: {
          notifications: {
            email: true,
            discord: false,
            webhook: false,
            executionAlerts: true,
            failureAlerts: true,
            weeklyReports: false,
          },
          integrations: {
            discord: '',
            email: '',
            webhookUrl: '',
          },
        },
        notificationRules: [],
        usage: {
          executions: 0,
          workflows: 0,
          apiCalls: 0,
        },
      };
      users.push(user);
    }
    return user;
  },
  getSettings: (address: string): Partial<UserSettings> | undefined => {
    return userStore.findOrCreateUser(address).settings;
  },
  updateSettings: (address: string, newSettings: Partial<UserSettings>): User => {
    const user = userStore.findOrCreateUser(address);
    user.settings = {
      ...user.settings,
      ...newSettings,
      notifications: { ...user.settings.notifications, ...newSettings.notifications },
      integrations: { ...user.settings.integrations, ...newSettings.integrations },
    };
    console.log(`Updated settings for ${address}:`, user.settings);
    return user;
  },
  updateUsage: (address: string, newUsage: Partial<User['usage']>) => {
    const user = userStore.findOrCreateUser(address);
    user.usage = { ...user.usage, ...newUsage };
    console.log(`Updated usage for ${address}:`, user.usage);
    return user;
  },
  findByApiKey: (key: string): User | undefined => {
    return users.find(u => u.apiKey === key);
  },
  regenerateApiKey: (address: string): User | undefined => {
    const user = userStore.findOrCreateUser(address);
    if (user) {
      user.apiKey = randomBytes(24).toString('hex');
      console.log(`Regenerated API key for ${address}`);
      return user;
    }
  },
  incrementApiCall: (address: string) => {
    const user = userStore.findOrCreateUser(address);
    if (user) {
      user.usage.apiCalls++;
    }
  },
  getRules: (address: string): NotificationRule[] => {
    return userStore.findOrCreateUser(address).notificationRules;
  },
  addRule: (address: string, ruleData: Omit<NotificationRule, 'id'>): NotificationRule => {
    const user = userStore.findOrCreateUser(address);
    const newRule: NotificationRule = {
      ...ruleData,
      id: randomBytes(8).toString('hex'),
    };
    user.notificationRules.push(newRule);
    console.log(`Added new notification rule for ${address}:`, newRule);
    return newRule;
  },
  updateRule: (address: string, ruleId: string, updates: Partial<NotificationRule>): NotificationRule | undefined => {
    const user = userStore.findOrCreateUser(address);
    const ruleIndex = user.notificationRules.findIndex(r => r.id === ruleId);
    if (ruleIndex > -1) {
      const updatedRule = { ...user.notificationRules[ruleIndex], ...updates };
      user.notificationRules[ruleIndex] = updatedRule;
      console.log(`Updated notification rule ${ruleId} for ${address}:`, updatedRule);
      return updatedRule;
    }
    return undefined;
  },
  deleteRule: (address: string, ruleId: string): boolean => {
    const user = userStore.findOrCreateUser(address);
    const ruleIndex = user.notificationRules.findIndex(r => r.id === ruleId);
    if (ruleIndex > -1) {
      user.notificationRules.splice(ruleIndex, 1);
      console.log(`Deleted notification rule ${ruleId} for ${address}.`);
      return true;
    }
    return false;
  },
  upgradePlan: (address: string, planId: 'monthly' | 'bimonthly') => {
    const user = userStore.findOrCreateUser(address);
    if (user) {
      user.plan = planId;
      const now = new Date();
      if (planId === 'monthly') {
        now.setMonth(now.getMonth() + 1);
        user.planExpiresAt = now.toISOString();
      } else if (planId === 'bimonthly') {
        now.setMonth(now.getMonth() + 2);
        user.planExpiresAt = now.toISOString();
      }
      user.usage.executions = 0;
      console.log(`User ${address} upgraded to ${planId} plan, expiring on ${user.planExpiresAt}. Executions reset.`);
      return user;
    }
  },
};

// In-memory portfolio store for dynamic updates
export interface PortfolioAsset {
  symbol: string;
  amount: number;
  alerts?: any[];
}

let portfolio: PortfolioAsset[] = [];

export const portfolioStore = {
  get: () => portfolio,
  set: (newPortfolio: PortfolioAsset[]) => {
    portfolio = newPortfolio;
  },
  updateAsset: (symbol: string, amount: number) => {
    const asset = portfolio.find(a => a.symbol === symbol);
    if (asset) {
      asset.amount = amount;
    } else {
      portfolio.push({ symbol, amount, alerts: [] });
    }
  }
}; 