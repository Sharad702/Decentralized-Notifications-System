import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import DashboardStats from './DashboardStats';
import WorkflowCard from './WorkflowCard';
import CreateWorkflowModal from './CreateWorkflowModal';

interface DashboardProps {
  workflows: any[];
  stats: any;
  onCreateWorkflow: (workflow: any, isTemplateUsed?: boolean) => void;
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
    <div className="lg:ml-72 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-0 mb-6 lg:mb-8"
          >
            <div>
              <motion.h1 
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Dashboard
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-base lg:text-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                <span className="hidden sm:inline">Manage your Web3 automation workflows</span>
                <span className="sm:hidden">Web3 automation</span>
              </motion.p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl w-full lg:w-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Create Workflow
            </motion.button>
          </motion.div>

          {/* Stats */}
          <DashboardStats stats={stats} />
        </div>

        {/* Workflows Section */}
        <div className="mb-6 lg:mb-8">
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6 lg:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                Your Workflows
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 lg:pl-12 pr-4 lg:pr-6 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md items-center justify-center lg:flex-none"
              >
                <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
              </motion.button>
            </div>
          </motion.div>

          {/* Workflows Grid */}
          {filteredWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
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
              className="text-center py-12 lg:py-20"
            >
              <div className="relative mb-6 lg:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-slate-100 to-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-lg">
                  <Plus className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">
                {searchTerm ? 'No workflows found' : 'Ready to automate?'}
              </h3>
              <p className="text-slate-600 mb-6 lg:mb-8 text-base lg:text-lg max-w-md mx-auto px-4">
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
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