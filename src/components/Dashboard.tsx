import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import DashboardStats from './DashboardStats';
import WorkflowCard from './WorkflowCard';
import CreateWorkflowModal from './CreateWorkflowModal';

interface DashboardProps {
  workflows: any[];
  stats: any;
  onCreateWorkflow: (workflow: any) => void;
  onToggleWorkflow: (id: string) => void;
  onEditWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
  templates: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  workflows, 
  stats, 
  onCreateWorkflow, 
  onToggleWorkflow, 
  onEditWorkflow,
  onDeleteWorkflow,
  templates
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ml-72 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Dashboard
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
                Manage your Web3 automation workflows
              </motion.p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              <Plus className="w-5 h-5" />
              Create Workflow
            </motion.button>
          </motion.div>

          {/* Stats */}
          <DashboardStats stats={stats} />
        </div>

        {/* Workflows Section */}
        <div className="mb-8">
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Your Workflows
              </h2>
              {/* <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200/50">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{workflows.length} Active</span>
              </div> */}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <Filter className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>
          </motion.div>

          {/* Workflows Grid */}
          {filteredWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredWorkflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <WorkflowCard
                    workflow={workflow}
                    onToggle={onToggleWorkflow}
                    onEdit={onEditWorkflow}
                    onDelete={onDeleteWorkflow}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-slate-100 to-white p-8 rounded-3xl border border-slate-200 shadow-lg">
                  <Plus className="w-20 h-20 mx-auto mb-6 text-slate-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {searchTerm ? 'No workflows found' : 'Ready to automate?'}
              </h3>
              <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for' 
                  : 'Create your first workflow and start automating your Web3 interactions'
                }
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Your First Workflow
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Create Workflow Modal */}
        <CreateWorkflowModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateWorkflow}
          templates={templates}
        />
      </div>
    </div>
  );
};

export default Dashboard;