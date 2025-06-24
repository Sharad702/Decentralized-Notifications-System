export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event';
  actionType: 'email' | 'webhook' | 'discord';
  sourceAddress: string;
  actionParams: Record<string, any>;
  isActive: boolean;
  executionCount: number;
  successRate: number;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface DashboardStats {
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number;
  activeWorkflows: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
}