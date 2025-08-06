import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  Coins, 
  Palette, 
  Activity, 
  Mail, 
  Webhook, 
  MessageSquare,
  TrendingUp,
  Zap,
  Tag,
  Plus,
  Minus,
  Info,
  Sparkles,
  Crown,
  Users,
  Settings,
  FileText,
  MessageCircle
} from 'lucide-react';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: any) => void;
  initialData?: any;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as 'defi' | 'nft' | 'gaming' | 'dao' | 'custom',
    triggerType: 'eth_transfer' as 'eth_transfer' | 'nft_purchase' | 'contract_event' | 'token_transfer' | 'price_alert',
    actionType: 'email' as 'email' | 'webhook' | 'discord' | 'slack' | 'telegram',
    tags: [] as string[],
    message: {
      subject: '',
      body: '',
      variables: [] as string[]
    },
    config: {
      triggerConfig: {} as Record<string, any>,
      actionConfig: {} as Record<string, any>
    }
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    { id: 'defi', label: 'DeFi', description: 'Decentralized Finance workflows', icon: Zap, color: 'blue' },
    { id: 'nft', label: 'NFT', description: 'Non-Fungible Token monitoring', icon: Palette, color: 'purple' },
    { id: 'gaming', label: 'Gaming', description: 'Gaming and P2E workflows', icon: Users, color: 'green' },
    { id: 'dao', label: 'DAO', description: 'Governance and DAO activities', icon: Crown, color: 'orange' }
  ];

  const triggerOptions = [
    {
      id: 'eth_transfer',
      label: 'ETH Transfer',
      description: 'Monitor Ethereum transfers',
      icon: Coins,
      color: 'blue'
    },
    {
      id: 'nft_purchase',
      label: 'NFT Purchase',
      description: 'Track NFT marketplace activity',
      icon: Palette,
      color: 'purple'
    },
    {
      id: 'contract_event',
      label: 'Contract Event',
      description: 'Monitor smart contract events',
      icon: Activity,
      color: 'green'
    },
    {
      id: 'token_transfer',
      label: 'Token Transfer',
      description: 'Track ERC-20 token movements',
      icon: Zap,
      color: 'yellow'
    },
    {
      id: 'price_alert',
      label: 'Price Alert',
      description: 'Monitor price changes',
      icon: TrendingUp,
      color: 'red'
    }
  ];

  const actionOptions = [
    // {
    //   id: 'email',
    //   label: 'Send Email',
    //   description: 'Send notification via email',
    //   icon: Mail,
    //   color: 'blue'
    // },
    // {
    //   id: 'webhook',
    //   label: 'Call Webhook',
    //   description: 'Send HTTP request to webhook',
    //   icon: Webhook,
    //   color: 'green'
    // },
    {
      id: 'discord',
      label: 'Discord Message',
      description: 'Send message to Discord channel',
      icon: MessageSquare,
      color: 'indigo'
    }
    // {
    //   id: 'slack',
    //   label: 'Slack Message',
    //   description: 'Send message to Slack channel',
    //   icon: MessageSquare,
    //   color: 'purple'
    // },
    // {
    //   id: 'telegram',
    //   label: 'Telegram Message',
    //   description: 'Send message via Telegram bot',
    //   icon: MessageSquare,
    //   color: 'cyan'
    // }
  ];

  const messageVariables = [
    { key: '{{user_name}}', description: 'User\'s name' },
    { key: '{{trigger_data}}', description: 'Data from the trigger event' },
    { key: '{{timestamp}}', description: 'Current timestamp' },
    { key: '{{workflow_name}}', description: 'Name of the workflow' },
    { key: '{{amount}}', description: 'Transaction amount (if applicable)' },
    { key: '{{address}}', description: 'Wallet address' },
    { key: '{{tx_hash}}', description: 'Transaction hash' }
  ];

  // Prefill formData if initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setStep(1);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        triggerType: 'eth_transfer',
        actionType: 'email',
        tags: [],
        message: {
          subject: '',
          body: '',
          variables: []
        },
        config: {
          triggerConfig: {},
          actionConfig: {}
        }
      });
      setStep(1);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template = {
      ...formData,
      isPublic: false, // Always private for user templates
      isPremium: false
    };

    onSubmit(template);
    onClose();
    
    // Reset form
    setStep(1);
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      triggerType: 'eth_transfer',
      actionType: 'email',
      tags: [],
      message: {
        subject: '',
        body: '',
        variables: []
      },
      config: {
        triggerConfig: {},
        actionConfig: {}
      }
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.message.body;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setFormData({
        ...formData,
        message: {
          ...formData.message,
          body: newText
        }
      });
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic Information</h3>
              <p className="text-slate-600">Set up the foundation of your template</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., DeFi Yield Alert Template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this template does and when to use it..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = formData.category === category.id;
                    
                    return (
                      <motion.button
                        key={category.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData({ ...formData, category: category.id as any })}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-sm text-slate-600">{category.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Trigger Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {triggerOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.triggerType === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData({ ...formData, triggerType: option.id as any })}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-slate-600">{option.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Action Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {actionOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.actionType === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData({ ...formData, actionType: option.id as any })}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-slate-600">{option.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-indigo-500 hover:text-indigo-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Configuration</h3>
              <p className="text-slate-600">Customize the message that will be sent when your template is triggered</p>
            </div>

            <div className="space-y-6">
              {/* Subject Line (for email) */}
              {/* {formData.actionType === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.message.subject}
                    onChange={(e) => setFormData({
                      ...formData,
                      message: { ...formData.message, subject: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 🚨 {{workflow_name}} Alert - {{trigger_data}}"
                  />
                </div>
              )} */}

              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message Content *
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <textarea
                      id="message-body"
                      required
                      value={formData.message.body}
                      onChange={(e) => setFormData({
                        ...formData,
                        message: { ...formData.message, body: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                      rows={12}
                      placeholder={`Hello {{user_name}},

Your workflow "{{workflow_name}}" has been triggered!

Event Details:
• Trigger: ${formData.triggerType.replace('_', ' ')}
• Timestamp: {{timestamp}}
• Data: {{trigger_data}}

Best regards,
BlockFlow Team`}
                    />
                  </div>
                  
                  {/* Variables Panel */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Available Variables
                    </h4>
                    <div className="space-y-2">
                      {messageVariables.map((variable, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => insertVariable(variable.key)}
                          className="w-full text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                        >
                          <div className="font-mono text-sm text-indigo-600 group-hover:text-indigo-700">
                            {variable.key}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {variable.description}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700">
                          <p className="font-medium mb-1">Pro Tip:</p>
                          <p>Click on any variable to insert it at your cursor position in the message.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-medium text-slate-900">Message Preview</h4>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  {formData.actionType === 'email' && formData.message.subject && (
                    <div className="mb-3 pb-3 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-600">Subject:</p>
                      <p className="font-semibold text-slate-900">{formData.message.subject}</p>
                    </div>
                  )}
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">
                    {formData.message.body || 'Your message will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Create Template
                  </h2>
                  <p className="text-slate-600 mt-1">Step {step} of 2</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 2) * 100}%` }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {renderStep()}

              {/* Navigation */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    Previous
                  </motion.button>
                )}
                
                {step < 2 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-medium"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-medium"
                  >
                    {initialData ? 'Update Template' : 'Create Template'}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTemplateModal;