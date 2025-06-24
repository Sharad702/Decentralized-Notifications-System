import { randomBytes } from 'crypto';
// A simple in-memory data store for our workflows.
// In a real application, this would be replaced by a database connection.

export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event';
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
}

const workflows: Workflow[] = [];

export const workflowStore = {
  getAll: () => workflows,
  add: (workflow: Workflow) => {
    workflows.push(workflow);
  },
  findById: (id: string) => workflows.find(w => w.id === id),
  incrementExecutionCount: (id: string) => {
    const workflow = workflowStore.findById(id);
    if (workflow) {
      if (workflow.previousExecutionCount === undefined) {
        workflow.previousExecutionCount = workflow.executionCount;
      }
      workflow.executionCount++;
      workflow.lastTriggered = new Date().toISOString();
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