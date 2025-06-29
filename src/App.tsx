import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowsPage from './components/WorkflowsPage';
import AnalyticsPage from './components/AnalyticsPage';
import TemplatesPage from './components/TemplatePage';
import SettingsPage from './components/SettingsPage';
import CreateWorkflowModal from './components/CreateWorkflowModal';
import { useWallet } from './hooks/useWallet';

const API_URL = 'http://localhost:5001';
const WS_URL = 'ws://localhost:5001';

// Add Template type (reuse from TemplatePage or centralize in types/index.ts)
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'defi' | 'nft' | 'gaming' | 'dao' | 'custom';
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event' | 'token_transfer' | 'price_alert';
  actionType: 'email' | 'webhook' | 'discord' | 'slack' | 'telegram';
  isPublic: boolean;
  isFavorite: boolean;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  message: {
    subject: string;
    body: string;
    variables: string[];
  };
  config: {
    triggerConfig: Record<string, any>;
    actionConfig: Record<string, any>;
  };
}

function App() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  const fetchWorkflows = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address) {
      setWorkflows([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/workflows?userAddress=${wallet.address}`);
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    }
  }, [wallet.isConnected, wallet.address]);

  const handleWorkflowUpdate = useCallback((updatedWorkflow: any) => {
    setWorkflows(prevWorkflows => 
      prevWorkflows.map(w => 
        w.id === updatedWorkflow.workflowId 
          ? { ...w, executionCount: updatedWorkflow.executionCount, lastTriggered: updatedWorkflow.lastTriggered }
          : w
      )
    );
  }, []);

  useEffect(() => {
    if (wallet.isInitializing) {
      return; // Wait for wallet connection to be checked
    }

    if (!wallet.isConnected || !wallet.address) {
      setWorkflows([]);
      return; // Clear data and do nothing else if not connected
    }

    fetchWorkflows();

    // Setup WebSocket connection
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received WebSocket message:', message);

      if (message.type === 'WORKFLOW_EXECUTED') {
        handleWorkflowUpdate(message.payload);
      } else if (message.type === 'WORKFLOW_TOGGLED') {
        setWorkflows(prevWorkflows => 
          prevWorkflows.map(w => 
            w.id === message.payload.id ? message.payload : w
          )
        );
      } else if (message.type === 'WORKFLOW_DELETED') {
        setWorkflows(prevWorkflows => 
          prevWorkflows.filter(w => w.id !== message.payload.workflowId)
        );
      } else if (message.type === 'WORKFLOW_UPDATED') {
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(w =>
            w.id === message.payload.id ? message.payload : w
          )
        );
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };

  }, [wallet.isConnected, wallet.isInitializing, wallet.address, handleWorkflowUpdate, fetchWorkflows]);

  const stats = {
    totalWorkflows: workflows.length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
    successRate: workflows.length > 0
      ? Math.round(
          workflows.reduce((sum, w) => sum + (Number(w.successRate) || 0), 0) / workflows.length
        )
      : 0,
    activeWorkflows: workflows.filter(w => w.isActive).length
  };

  const handleCreateWorkflow = async (newWorkflowData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newWorkflowData, userAddress: wallet.address }),
      });
      const newWorkflow = await response.json();
      setWorkflows([...workflows, newWorkflow]);
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  };

  const handleToggleWorkflow = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workflows/${id}/toggle`, {
        method: 'PATCH',
      });
      if (response.ok) {
        const updatedWorkflow = await response.json();
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(w => (w.id === updatedWorkflow.id ? updatedWorkflow : w))
        );
      } else {
        console.error('Failed to toggle workflow status');
      }
    } catch (error) {
      console.error("Failed to toggle workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    // Optional: Add a confirmation dialog before deleting
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await fetch(`${API_URL}/api/workflows/${id}`, {
          method: 'DELETE',
        });
        // The backend will broadcast the update.
      } catch (error) {
        console.error("Failed to delete workflow:", error);
      }
    }
  };

  const handleEditWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) setEditingWorkflow(workflow);
  };

  const handleUpdateWorkflow = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchWorkflows(); // Refresh workflows after update
      setEditingWorkflow(null);
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  // Fetch templates from backend
  const fetchTemplates = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address) {
      setTemplates([]);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/templates?userAddress=${wallet.address}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, [wallet.isConnected, wallet.address]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Create template
  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...templateData, userAddress: wallet.address }),
      });
      const newTemplate = await response.json();
      setTemplates(prev => [...prev, newTemplate]);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Edit template
  const handleEditTemplate = async (id: string, updates: any) => {
    try {
      const response = await fetch(`${API_URL}/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await response.json();
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await fetch(`${API_URL}/api/templates/${id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  // Add this function to handle workflow modal submit
  const handleWorkflowModalSubmit = async (data: any, isTemplateUsed: boolean) => {
    if (isTemplateUsed && data.id) {
      // Increment usageCount for the template
      try {
        const res = await fetch(`${API_URL}/api/templates/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageCount: 'increment' })
        });
        const updated = await res.json();
        setTemplates(prev => prev.map(t => t.id === data.id ? updated : t));
        // Create the workflow using the template's data and user input
        await handleCreateWorkflow({
          name: data.name,
          description: data.description,
          triggerType: data.triggerType,
          actionType: data.actionType,
          sourceAddress: data.sourceAddress,
          actionParams: data.actionParams,
          message: data.message,
          isActive: true,
          executionCount: 0,
          successRate: 100,
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Failed to increment template usage or create workflow:', error);
      }
    } else {
      await handleCreateWorkflow(data);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            workflows={workflows}
            stats={stats}
            onCreateWorkflow={handleCreateWorkflow}
            onToggleWorkflow={handleToggleWorkflow}
            onEditWorkflow={handleEditWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            templates={templates}
          />
        );
      case 'workflows':
        return (
          <div className="ml-72">
            <WorkflowsPage
              workflows={workflows}
              onCreateWorkflow={handleCreateWorkflow}
              onToggleWorkflow={handleToggleWorkflow}
              onEditWorkflow={handleEditWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              templates={templates}
              showCreateWorkflowModal={showCreateWorkflowModal}
              setShowCreateWorkflowModal={setShowCreateWorkflowModal}
            />
          </div>
        );
      case 'templates':
        return (
          <div className="ml-72">
            <TemplatesPage
              onCreateWorkflow={handleCreateWorkflow}
              templates={templates}
              setTemplates={setTemplates}
              onCreateTemplate={handleCreateTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="ml-72">
            <AnalyticsPage workflows={workflows} onRefresh={fetchWorkflows} />
          </div>
        );
      case 'settings':
        return (
          <div className="ml-72">
            <SettingsPage wallet={wallet} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        wallet={wallet}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
      />
      {renderContent()}
      <CreateWorkflowModal
        isOpen={showCreateWorkflowModal || !!editingWorkflow}
        onClose={() => { setShowCreateWorkflowModal(false); setEditingWorkflow(null); }}
        onSubmit={showCreateWorkflowModal ? handleWorkflowModalSubmit : (data) => handleUpdateWorkflow(editingWorkflow.id, data)}
        initialData={editingWorkflow}
        templates={templates}
      />
    </div>
  );
}

export default App;