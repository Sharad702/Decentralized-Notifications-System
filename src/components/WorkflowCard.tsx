import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Mail, 
  Webhook, 
  MessageSquare, 
  Coins,
  Palette,
  Activity,
  MoreVertical,
  Play,
  Pause,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
} from 'lucide-react';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event';
    actionType: 'email' | 'webhook' | 'discord';
    isActive: boolean;
    executionCount: number;
    successRate: number;
    lastTriggered?: string;
  };
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onToggle, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'eth_transfer': return <Coins className="w-5 h-5" />;
      case 'nft_purchase': return <Palette className="w-5 h-5" />;
      case 'contract_event': return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      case 'discord': return <MessageSquare className="w-5 h-5" />;
      default: return <Webhook className="w-5 h-5" />;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'eth_transfer': return 'ETH Transfer';
      case 'nft_purchase': return 'NFT Purchase';
      case 'contract_event': return 'Contract Event';
      default: return type;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'webhook': return 'Webhook';
      case 'discord': return 'Discord';
      default: return type;
    }
  };

  const getTriggerColors = (type: string) => {
    switch (type) {
      case 'eth_transfer': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'nft_purchase': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'contract_event': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getActionColors = (type: string) => {
    switch (type) {
      case 'email': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'webhook': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'discord': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const triggerColors = getTriggerColors(workflow.triggerType);
  const actionColors = getActionColors(workflow.actionType);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 opacity-60"></div>
      
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${workflow.isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}></div>

      {/* Header */}
      <div className="relative z-10 p-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-sm font-semibold ${workflow.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {workflow.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {workflow.name}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {workflow.description}
            </p>
          </div>
          
          <div className="relative flex items-center gap-2 ml-4">
            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 12 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(workflow.id)}
              className={`p-3 rounded-2xl transition-colors ${
                workflow.isActive
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={workflow.isActive ? 'Pause Workflow' : 'Play Workflow'}
            >
              {workflow.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>
            {/* 3-dots Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-300 z-20"
              aria-label="Open menu"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Overlay for outside click */}
                  <motion.div
                    key="menu-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 z-30"
                  >
                    <ul className="p-2">
                      <li>
                        <button 
                          onClick={() => { onEdit(workflow.id); setIsMenuOpen(false); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => { onDelete(workflow.id); setIsMenuOpen(false); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Workflow Flow */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-3 px-4 py-3 ${triggerColors.bg} ${triggerColors.text} rounded-2xl border ${triggerColors.border} shadow-sm`}
          >
            {getTriggerIcon(workflow.triggerType)}
            <span className="text-sm font-semibold">
              {getTriggerLabel(workflow.triggerType)}
            </span>
          </motion.div>
          
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-3 px-4 py-3 ${actionColors.bg} ${actionColors.text} rounded-2xl border ${actionColors.border} shadow-sm`}
          >
            {getActionIcon(workflow.actionType)}
            <span className="text-sm font-semibold">
              {getActionLabel(workflow.actionType)}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 px-8 py-6 bg-gradient-to-r from-slate-50/80 to-white/80 border-t border-slate-200/50">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executions</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {(typeof workflow.executionCount === 'number' ? workflow.executionCount : 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {workflow.successRate}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Run</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {workflow.lastTriggered ? (
                <>
                  <span>
                    {new Date(workflow.lastTriggered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <br />
                  <span>
                    {new Date(workflow.lastTriggered).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : (
                'Never'
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkflowCard;