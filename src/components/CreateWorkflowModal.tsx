import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Coins, Palette, Activity, Mail, Webhook, MessageSquare } from 'lucide-react';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, isTemplateUsed: boolean) => void;
  initialData?: any;
  templates: any[];
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ isOpen, onClose, onSubmit, initialData, templates }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerType: 'eth_transfer' as 'eth_transfer' | 'nft_purchase' | 'contract_event',
    actionType: 'email' as 'email' | 'webhook' | 'discord',
    sourceAddress: '',
    actionParams: {
      email: '',
      webhookUrl: '',
      discordWebhook: ''
    },
    isActive: true
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (initialData) {
      // Try to match the template by name (or id if available)
      const matchedTemplate = templates.find(
        t => t.name === initialData.name
      );
      if (matchedTemplate) {
        setSelectedTemplateId(matchedTemplate.id);
      } else {
        setSelectedTemplateId('default');
      }
      setForm({
        ...initialData,
        actionParams: {
          email: initialData.actionParams?.email || '',
          webhookUrl: initialData.actionParams?.webhookUrl || '',
          discordWebhook: initialData.actionParams?.discordWebhook || ''
        }
      });
    } else {
      setSelectedTemplateId('default');
      setForm({
        name: '',
        description: '',
        triggerType: 'eth_transfer',
        actionType: 'email',
        sourceAddress: '',
        actionParams: {
          email: '',
          webhookUrl: '',
          discordWebhook: ''
        },
        isActive: true
      });
    }
  }, [initialData, isOpen]);

  // Pre-fill form when a template is selected, but NOT when editing
  useEffect(() => {
    if (!initialData && selectedTemplateId !== 'default') {
      const t = templates.find(t => t.id === selectedTemplateId);
      if (t) {
        setForm({
          name: t.name,
          description: t.description,
          triggerType: t.triggerType,
          actionType: t.actionType,
          sourceAddress: '', // let user fill
          actionParams: {
            email: '',
            webhookUrl: '',
            discordWebhook: ''
          },
          isActive: true
        });
      }
    }
  }, [selectedTemplateId, templates, initialData]);

  const triggerOptions = [
    {
      id: 'eth_transfer',
      label: 'ETH Transfer',
      description: 'Trigger when ETH is transferred',
      icon: Coins
    },
    {
      id: 'nft_purchase',
      label: 'NFT Purchase',
      description: 'Trigger when an NFT is purchased',
      icon: Palette
    },
    {
      id: 'contract_event',
      label: 'Contract Event',
      description: 'Trigger on smart contract events',
      icon: Activity
    }
  ];

  const actionOptions = [
    // {
    //   id: 'email',
    //   label: 'Send Email',
    //   description: 'Send notification via email',
    //   icon: Mail
    // },
    // {
    //   id: 'webhook',
    //   label: 'Call Webhook',
    //   description: 'Send HTTP request to webhook',
    //   icon: Webhook
    // },
    {
      id: 'discord',
      label: 'Discord Message',
      description: 'Send message to Discord channel',
      icon: MessageSquare
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let workflowName = form.name;
    let workflowDescription = form.description;
    if (selectedTemplateId !== 'default' && selectedTemplate) {
      workflowName = selectedTemplate.name;
      workflowDescription = selectedTemplate.description;
    }

    const workflow = {
      id: Date.now().toString(),
      name: workflowName,
      description: workflowDescription,
      triggerType: selectedTemplateId !== 'default' && selectedTemplate ? selectedTemplate.triggerType : form.triggerType,
      actionType: selectedTemplateId !== 'default' && selectedTemplate ? selectedTemplate.actionType : form.actionType,
      sourceAddress: form.sourceAddress,
      actionParams: form.actionParams,
      isActive: form.isActive,
      executionCount: 0,
      successRate: 100,
      createdAt: new Date()
    };

    if (selectedTemplateId !== 'default' && selectedTemplate) {
      // Pass user input along with template, ensuring form fields take precedence
      onSubmit({
        ...selectedTemplate,
        ...form
      }, true); // true = template used
    } else {
      onSubmit(workflow, false); // false = default
    }
    onClose();

    setForm({
      name: '',
      description: '',
      triggerType: 'eth_transfer',
      actionType: 'email',
      sourceAddress: '',
      actionParams: {
        email: '',
        webhookUrl: '',
        discordWebhook: ''
      },
      isActive: true
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200"
            >
              {/* Header and Template Dropdown */}
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    {initialData ? 'Edit Workflow' : 'Create New Workflow'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                  <select
                    className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    disabled={templates.length === 0}
                    style={templates.length === 0 ? { backgroundColor: '#f3f4f6', color: '#9ca3af' } : {}}
                  >
                    <option value="default">Default</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* If default, show full form. If template, show only relevant field. */}
                {selectedTemplateId === 'default' ? (
                  <>
                    {/* Workflow Name (editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                        placeholder="e.g., ETH Transfer Alert"
                      />
                    </div>
                    {/* Description (editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        required
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 lg:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                        rows={2}
                        placeholder="Describe what this workflow does..."
                      />
                    </div>

                    {/* Trigger Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Trigger
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {triggerOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = form.triggerType === option.id;
                          
                          return (
                            <motion.button
                              key={option.id}
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setForm({ ...form, triggerType: option.id as any })}
                              className={`p-3 lg:p-4 border rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 lg:gap-3">
                                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                <div>
                                  <div className="font-medium text-sm lg:text-base">{option.label}</div>
                                  <div className="text-xs lg:text-sm text-gray-600">{option.description}</div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Source Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Address to Monitor
                      </label>
                      <input
                        type="text"
                        required
                        value={form.sourceAddress}
                        onChange={e => setForm({ ...form, sourceAddress: e.target.value })}
                        className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs lg:text-sm"
                        placeholder="0x..."
                      />
                    </div>

                    {/* Action Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Action
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {actionOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = form.actionType === option.id;
                          
                          return (
                            <motion.button
                              key={option.id}
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setForm({ ...form, actionType: option.id as any })}
                              className={`p-3 lg:p-4 border rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 lg:gap-3">
                                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                <div>
                                  <div className="font-medium text-sm lg:text-base">{option.label}</div>
                                  <div className="text-xs lg:text-sm text-gray-600">{option.description}</div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Parameters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {form.actionType === 'email' && 'Email Address'}
                        {form.actionType === 'webhook' && 'Webhook URL'}
                        {form.actionType === 'discord' && 'Discord Webhook URL'}
                      </label>
                      {form.actionType === 'email' && (
                        <input
                          type="email"
                          required
                          value={form.actionParams.email}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, email: e.target.value } })}
                          className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                          placeholder="notification@example.com"
                        />
                      )}
                      {form.actionType === 'webhook' && (
                        <input
                          type="url"
                          required
                          value={form.actionParams.webhookUrl}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, webhookUrl: e.target.value } })}
                          className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                          placeholder="https://api.example.com/webhook"
                        />
                      )}
                      {form.actionType === 'discord' && (
                        <input
                          type="url"
                          required
                          value={form.actionParams.discordWebhook}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, discordWebhook: e.target.value } })}
                          className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                          placeholder="Discord webhook URL"
                        />
                      )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                      >
                        Create Workflow
                      </motion.button>
                    </div>
                  </>
                ) : (
                  selectedTemplate && <>
                    {/* Workflow Name (disabled) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        disabled
                        className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm lg:text-base"
                      />
                    </div>
                    {/* Description (disabled) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={selectedTemplate.description}
                        disabled
                        className="w-full px-3 lg:px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm lg:text-base"
                        rows={2}
                      />
                    </div>
                    {/* Always ask for address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Address to Monitor</label>
                      <input
                        type="text"
                        required
                        value={form.sourceAddress}
                        onChange={e => setForm({ ...form, sourceAddress: e.target.value })}
                        className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs lg:text-sm"
                        placeholder="0x..."
                      />
                    </div>
                    {/* Action Param (email/webhook/discord) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {/* {selectedTemplate.actionType === 'email' && 'Email Address'} */}
                        {/* {selectedTemplate.actionType === 'webhook' && 'Webhook URL'} */}
                        {selectedTemplate.actionType === 'discord' && 'Discord Webhook URL'}
                      </label>
                      {/* {selectedTemplate.actionType === 'email' && (
                        <input
                          type="email"
                          required
                          value={form.actionParams.email}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, email: e.target.value } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="notification@example.com"
                        />
                      )}
                      {selectedTemplate.actionType === 'webhook' && (
                        <input
                          type="url"
                          required
                          value={form.actionParams.webhookUrl}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, webhookUrl: e.target.value } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://api.example.com/webhook"
                        />
                      )} */}
                      {selectedTemplate.actionType === 'discord' && (
                        <input
                          type="url"
                          required
                          value={form.actionParams.discordWebhook}
                          onChange={e => setForm({ ...form, actionParams: { ...form.actionParams, discordWebhook: e.target.value } })}
                          className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                          placeholder="Discord webhook URL"
                        />
                      )}
                    </div>
                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                      >
                        Create Workflow
                      </motion.button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateWorkflowModal;