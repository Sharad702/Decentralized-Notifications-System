import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Webhook, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Percent,
  Bell,
  Info,
  Coins,
  BarChart3,
  Calendar
} from 'lucide-react';

interface CreatePortfolioAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: any) => void;
  portfolio: any[];
}

const CreatePortfolioAlertModal: React.FC<CreatePortfolioAlertModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  portfolio 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alertType: 'portfolio_value' as 'portfolio_value' | 'price_target' | 'stop_loss' | 'daily_summary' | 'allocation_change',
    actionType: 'email' as 'email' | 'webhook' | 'discord' | 'telegram',
    threshold: '',
    asset: '',
    actionParams: {
      email: '',
      webhookUrl: '',
      discordWebhook: '',
      telegramBot: '',
      telegramChat: ''
    },
    config: {
      percentage: '',
      targetPrice: '',
      stopLossPrice: '',
      timeframe: 'daily',
      direction: 'both' as 'up' | 'down' | 'both'
    }
  });

  const alertTypes = [
    {
      id: 'portfolio_value',
      label: 'Portfolio Value Alert',
      description: 'Get notified when your total portfolio value changes significantly',
      icon: DollarSign,
      color: 'blue',
      example: 'Alert when portfolio value changes by ±10%'
    },
    {
      id: 'price_target',
      label: 'Price Target Alert',
      description: 'Set target prices for individual assets in your portfolio',
      icon: Target,
      color: 'green',
      example: 'Alert when ETH reaches $3,000'
    },
    {
      id: 'stop_loss',
      label: 'Stop Loss Alert',
      description: 'Protect your investments with automatic stop-loss notifications',
      icon: AlertTriangle,
      color: 'red',
      example: 'Alert when PEPE drops below $0.000002'
    },
    {
      id: 'allocation_change',
      label: 'Allocation Alert',
      description: 'Monitor when asset allocations drift from your targets',
      icon: BarChart3,
      color: 'purple',
      example: 'Alert when ETH allocation goes above 50%'
    },
    {
      id: 'daily_summary',
      label: 'Daily Summary',
      description: 'Regular portfolio performance summaries',
      icon: Calendar,
      color: 'orange',
      example: 'Daily portfolio performance report at 9:00 AM'
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
    // {
    //   id: 'telegram',
    //   label: 'Telegram Message',
    //   description: 'Send message via Telegram bot',
    //   icon: MessageSquare
    // }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alert = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.alertType,
      threshold: formData.threshold,
      asset: formData.asset,
      status: 'active',
      actionType: formData.actionType,
      actionParams: formData.actionParams,
      config: formData.config,
      createdAt: new Date(),
      lastTriggered: 'Never'
    };

    onSubmit(alert);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      alertType: 'portfolio_value',
      actionType: 'email',
      threshold: '',
      asset: '',
      actionParams: {
        email: '',
        webhookUrl: '',
        discordWebhook: '',
        telegramBot: '',
        telegramChat: ''
      },
      config: {
        percentage: '',
        targetPrice: '',
        stopLossPrice: '',
        timeframe: 'daily',
        direction: 'both'
      }
    });
  };

  const renderAlertConfiguration = () => {
    switch (formData.alertType) {
      case 'portfolio_value':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Percentage Change Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.config.percentage}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, percentage: e.target.value },
                    threshold: `±${e.target.value}%`
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="10"
                  min="1"
                  max="100"
                />
                <Percent className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 mt-1">Alert when portfolio value changes by this percentage</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Direction
              </label>
              <select
                value={formData.config.direction}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, direction: e.target.value as any }
                })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="both">Both increases and decreases</option>
                <option value="up">Only increases</option>
                <option value="down">Only decreases</option>
              </select>
            </div>
          </div>
        );

      case 'price_target':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Asset
              </label>
              <select
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose an asset from your portfolio</option>
                {portfolio.map(asset => (
                  <option key={asset.id} value={asset.token}>
                    {asset.token} ({asset.symbol}) - Current: {asset.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.config.targetPrice}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, targetPrice: e.target.value },
                    threshold: `$${e.target.value}`
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                  placeholder="3000"
                />
                <DollarSign className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        );

      case 'stop_loss':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Asset
              </label>
              <select
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose an asset from your portfolio</option>
                {portfolio.map(asset => (
                  <option key={asset.id} value={asset.token}>
                    {asset.token} ({asset.symbol}) - Current: {asset.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stop Loss Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.config.stopLossPrice}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, stopLossPrice: e.target.value },
                    threshold: `$${e.target.value}`
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                  placeholder="2200"
                />
                <DollarSign className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-xs text-red-600 mt-1">Alert when price drops below this level</p>
            </div>
          </div>
        );

      case 'allocation_change':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Asset
              </label>
              <select
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose an asset from your portfolio</option>
                {portfolio.map(asset => (
                  <option key={asset.id} value={asset.token}>
                    {asset.token} ({asset.symbol}) - Current allocation: {asset.allocation}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Allocation Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.config.percentage}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, percentage: e.target.value },
                    threshold: `${e.target.value}%`
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="50"
                  min="1"
                  max="100"
                />
                <Percent className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 mt-1">Alert when allocation goes above/below this percentage</p>
            </div>
          </div>
        );

      case 'daily_summary':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Summary Frequency
              </label>
              <select
                value={formData.config.timeframe}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, timeframe: e.target.value },
                  threshold: `${e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)} at 9:00 AM`
                })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Portfolio Summary</p>
                  <p>You'll receive regular reports including portfolio value, top performers, allocation changes, and key metrics.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedAlertType = alertTypes.find(type => type.id === formData.alertType);

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Bell className="w-7 h-7 text-blue-500" />
                    Create Portfolio Alert
                  </h2>
                  <p className="text-slate-600 mt-1">Set up intelligent alerts based on your portfolio</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alert Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Portfolio Value Alert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what this alert monitors..."
                  />
                </div>
              </div>

              {/* Alert Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Alert Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {alertTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.alertType === type.id;
                    
                    return (
                      <motion.button
                        key={type.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData({ ...formData, alertType: type.id as any })}
                        className={`p-4 border rounded-xl text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{type.label}</div>
                            <div className="text-sm text-slate-600 mb-2">{type.description}</div>
                            <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                              💡 {type.example}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Configure {selectedAlertType?.label}
                </h3>
                {renderAlertConfiguration()}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-slate-400" />
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Notification Method
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
                        className={`p-4 border rounded-lg text-left transition-all ${
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

              {/* Action Parameters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notification Configuration
                </label>
                {/* {formData.actionType === 'email' && (
                  <input
                    type="email"
                    required
                    value={formData.actionParams.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      actionParams: { ...formData.actionParams, email: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your-email@example.com"
                  />
                )}
                {formData.actionType === 'webhook' && (
                  <input
                    type="url"
                    required
                    value={formData.actionParams.webhookUrl}
                    onChange={(e) => setFormData({
                      ...formData,
                      actionParams: { ...formData.actionParams, webhookUrl: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.example.com/webhook"
                  />
                )} */}
                {formData.actionType === 'discord' && (
                  <input
                    type="url"
                    required
                    value={formData.actionParams.discordWebhook}
                    onChange={(e) => setFormData({
                      ...formData,
                      actionParams: { ...formData.actionParams, discordWebhook: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Discord webhook URL"
                  />
                )}
                {/* {formData.actionType === 'telegram' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      value={formData.actionParams.telegramBot}
                      onChange={(e) => setFormData({
                        ...formData,
                        actionParams: { ...formData.actionParams, telegramBot: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Telegram Bot Token"
                    />
                    <input
                      type="text"
                      required
                      value={formData.actionParams.telegramChat}
                      onChange={(e) => setFormData({
                        ...formData,
                        actionParams: { ...formData.actionParams, telegramChat: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chat ID"
                    />
                  </div>
                )} */}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium"
                >
                  Create Alert
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePortfolioAlertModal;   