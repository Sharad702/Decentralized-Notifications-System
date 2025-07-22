import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Wallet, 
  Key, 
  Globe, 
  Smartphone,
  Mail,
  MessageSquare,
  Webhook,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Settings as SettingsIcon,
  Zap,
  CreditCard,
  Database,
  Lock,
  Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface SettingsPageProps {
  wallet: {
    address: string | null;
    isConnected: boolean;
    balance: string;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = ({ wallet }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<any>({
    profile: {},
    notifications: {},
    security: {},
    integrations: {},
  });
  const [usage, setUsage] = useState({ executions: 0, workflows: 0, apiCalls: 0 });
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const TABS_WITH_SAVE_BUTTON = ['profile', 'integrations'];

  useEffect(() => {
    const fetchSettings = async () => {
      if (!wallet.isConnected || !wallet.address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${wallet.address}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const fetchUsage = async () => {
      if (!wallet.isConnected || !wallet.address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${wallet.address}/usage`);
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      }
    };

    const fetchApiKey = async () => {
      if (!wallet.isConnected || !wallet.address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${wallet.address}/api-key`);
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch API key:', error);
      }
    };

    fetchSettings();
    fetchUsage();
    fetchApiKey();
  }, [wallet.address, wallet.isConnected]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon }
  ];

  const handleCopyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateApiKey = async () => {
    if (!wallet.address) return;
    if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate your old key.')) {
      try {
        const response = await fetch(`${API_URL}/api/users/${wallet.address}/regenerate-api-key`, {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
          console.log('API Key regenerated successfully!');
        } else {
          console.error('Failed to regenerate API key');
        }
      } catch (error) {
        console.error('Error regenerating API key:', error);
      }
    }
  };

  const handleInstantSave = async (updatedSettings: any) => {
    // Optimistically update local state
    setSettings(updatedSettings);

    if (!wallet.address) {
      console.error('Cannot save settings, no wallet connected.');
      return;
    }
    try {
      await fetch(`${API_URL}/api/users/${wallet.address}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      console.log('Setting auto-saved.');
    } catch (error) {
      console.error('Error auto-saving setting:', error);
    }
  };

  const handleSave = async () => {
    if (!wallet.address) {
      console.error('Cannot save settings, no wallet connected.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${wallet.address}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        console.log('Settings saved successfully!');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Wallet Information</h3>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {wallet.isConnected ? (
                      <>
                        <p className="font-semibold text-slate-900">Connected Wallet</p>
                        <p className="text-sm text-slate-600 font-mono">{wallet.address}</p>
                        <p className="text-sm text-slate-600">Balance: {parseFloat(wallet.balance).toFixed(4)} ETH</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">No Wallet Connected</p>
                        <p className="text-sm text-slate-600">Connect your wallet to use BlockFlow</p>
                      </>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">User Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={settings.profile?.name || ''}
                    onChange={e => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select
                    value={settings.profile?.timezone || 'UTC'}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, timezone: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <select
                    value={settings.profile?.language || 'en'}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, language: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { key: 'executionAlerts', label: 'Workflow Execution Alerts', desc: 'Get notified when workflows are executed' },
                  { key: 'failureAlerts', label: 'Failure Notifications', desc: 'Receive alerts when workflows fail' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Get weekly performance summaries' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications?.[item.key as keyof typeof settings.notifications] || false}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            notifications: { ...settings.notifications, [item.key]: e.target.checked }
                          };
                          handleInstantSave(newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', icon: Mail },
                  { key: 'discord', label: 'Discord Notifications', icon: MessageSquare },
                  { key: 'webhook', label: 'Webhook Notifications', icon: Webhook }
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.key} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-600" />
                        <span className="font-medium text-slate-900">{channel.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications?.[channel.key as keyof typeof settings.notifications] || false}
                          onChange={(e) => {
                            const newSettings = {
                              ...settings,
                              notifications: { ...settings.notifications, [channel.key]: e.target.checked }
                            };
                            handleInstantSave(newSettings);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
              <div className="space-y-6">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security?.twoFactor || false}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            security: { ...settings.security, twoFactor: e.target.checked }
                          };
                          handleInstantSave(newSettings);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.security?.twoFactor === false && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Enable 2FA to secure your account</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="mb-4">
                    <p className="font-medium text-slate-900 mb-2">API Key</p>
                    <p className="text-sm text-slate-600 mb-4">Use this key to access BlockFlow API</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleCopyApiKey}
                      className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleRegenerateApiKey}
                      className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Regenerate API Key"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Integration Settings</h3>
              <div className="space-y-6">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-slate-900">Email Integration</p>
                      <p className="text-sm text-slate-600">Configure email notifications</p>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={settings.integrations.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, email: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your-email@example.com"
                  />
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-medium text-slate-900">Discord Integration</p>
                      <p className="text-sm text-slate-600">Connect your Discord webhook</p>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={settings.integrations.discord}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, discord: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Webhook className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-slate-900">Webhook Integration</p>
                      <p className="text-sm text-slate-600">Configure webhook endpoint</p>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={settings.integrations.webhookUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, webhookUrl: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing & Usage</h3>
              
              {/* Current Plan */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Free Plan</p>
                    <p className="text-sm text-slate-600">{usage.workflows} / 5 workflows used</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-blue-500" />
                    <p className="font-medium text-slate-900">Executions Used</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{usage.executions.toLocaleString()} / 100</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(usage.executions / 100) * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="w-6 h-6 text-purple-500" />
                    <p className="font-medium text-slate-900">API Calls</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{usage.apiCalls.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">this month</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Advanced Settings</h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-4">Data Management</h4>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium text-slate-900">Export Data</p>
                          <p className="text-sm text-slate-600">Download all your workflow data</p>
                        </div>
                      </div>
                      <RefreshCw className="w-5 h-5 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-red-600">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-red-500">Permanently delete your account and data</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-4">Developer Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Debug Mode</p>
                        <p className="text-sm text-slate-600">Enable detailed logging</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Beta Features</p>
                        <p className="text-sm text-slate-600">Access experimental features</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your account preferences and configurations
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
              <div className="p-8">
                {renderTabContent()}
              </div>
              
              {/* Save Button */}
              {TABS_WITH_SAVE_BUTTON.includes(activeTab) && (
                <div className="flex items-center justify-end gap-4 p-8 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;