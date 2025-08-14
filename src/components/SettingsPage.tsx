import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
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

const API_URL = 'https://decentralized-notifications-system-production.up.railway.app';

interface SettingsPageProps {
  wallet: string | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ wallet }) => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<any>({
    profile: {},
    notifications: {
      discord: true // Make Discord enabled by default
    },
    security: {},
    integrations: {},
  });
  const [usage, setUsage] = useState({ executions: 0, workflows: 0, apiCalls: 0 });
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const TABS_WITH_SAVE_BUTTON = ['profile', 'integrations'];

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isConnected || !address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${address}/settings`);
        if (response.ok) {
          const data = await response.json();
          const notifications = data.notifications || {};
          console.log('Backend settings:', data);
          console.log('Processed notifications:', notifications);
          setSettings((prev: any) => ({ 
            ...prev, 
            ...data,
            notifications: { ...notifications }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const fetchUsage = async () => {
      if (!isConnected || !address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${address}/usage`);
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      }
    };

    const fetchApiKey = async () => {
      if (!isConnected || !address) return;
      try {
        const response = await fetch(`${API_URL}/api/users/${address}/api-key`);
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
  }, [address, isConnected]);

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
    if (!address) return;
    if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate your old key.')) {
      try {
        const response = await fetch(`${API_URL}/api/users/${address}/regenerate-api-key`, {
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

    if (!address) {
      console.error('Cannot save settings, no wallet connected.');
      return;
    }
    try {
      await fetch(`${API_URL}/api/users/${address}/settings`, {
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
    if (!address) {
      console.error('Cannot save settings, no wallet connected.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${address}/settings`, {
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
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Wallet Information</h3>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 lg:p-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {isConnected ? (
                      <>
                        <p className="font-semibold text-slate-900">Connected Wallet</p>
                        <p className="text-sm text-slate-600 font-mono break-all">{address}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900">No Wallet Connected</p>
                        <p className="text-sm text-slate-600">Connect your wallet to use BlockFlow</p>
                      </>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">User Preferences</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={settings.profile?.name || ''}
                    onChange={e => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    className="w-full px-3 lg:px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm lg:text-base"
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
                    className="w-full px-3 lg:px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm lg:text-base"
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
                    className="w-full px-3 lg:px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm lg:text-base"
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
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4 lg:space-y-6">
                {[
                  { key: 'executionAlerts', label: 'Workflow Execution Alerts', desc: 'Get notified when workflows are executed' },
                  { key: 'failureAlerts', label: 'Failure Notifications', desc: 'Receive alerts when workflows fail' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Get weekly performance summaries' }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm lg:text-base">{item.label}</p>
                      <p className="text-xs lg:text-sm text-slate-600">{item.desc}</p>
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
                      <div className="w-10 h-6 lg:w-11 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  // { key: 'email', label: 'Email Notifications', icon: Mail },
                  { key: 'discord', label: 'Discord Notifications', icon: MessageSquare },
                  // { key: 'webhook', label: 'Webhook Notifications', icon: Webhook }
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
                        <span className="font-medium text-slate-900 text-sm lg:text-base">{channel.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications?.[channel.key as keyof typeof settings.notifications] || false}
                          onChange={(e) => {
                            const newSettings = {
                              ...settings,
                              notifications: { 
                                ...settings.notifications, 
                                [channel.key]: e.target.checked 
                              }
                            };
                            handleInstantSave(newSettings);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 lg:w-11 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm lg:text-base">Two-Factor Authentication</p>
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
                      <div className="w-10 h-6 lg:w-11 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.security?.twoFactor === false && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Enable 2FA to secure your account</span>
                    </div>
                  )}
                </div>

                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="mb-4">
                    <p className="font-medium text-slate-900 mb-2 text-sm lg:text-base">API Key</p>
                    <p className="text-sm text-slate-600 mb-4">Use this key to access BlockFlow API</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="w-full px-3 lg:px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs lg:text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" /> : <Copy className="w-4 h-4 lg:w-5 lg:h-5" />}
                      </button>
                      <button
                        onClick={handleRegenerateApiKey}
                        className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Regenerate API Key"
                      >
                        <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Integration Settings</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm lg:text-base">Discord Integration</p>
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
                    className="w-full px-3 lg:px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing & Usage</h3>
              
              {/* Current Plan */}
              <div className="p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 mb-1 text-sm lg:text-base">Free Plan</p>
                    <p className="text-sm text-slate-600">{usage.workflows} / 5 workflows used</p>
                  </div>
                  <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all text-sm lg:text-base">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                    <p className="font-medium text-slate-900 text-sm lg:text-base">Executions Used</p>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">{usage.executions.toLocaleString()} / 100</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(usage.executions / 100) * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                    <p className="font-medium text-slate-900 text-sm lg:text-base">API Calls</p>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">{usage.apiCalls.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">this month</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Advanced Settings</h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-4 text-sm lg:text-base">Data Management</h4>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium text-slate-900 text-sm lg:text-base">Export Data</p>
                          <p className="text-sm text-slate-600">Download all your workflow data</p>
                        </div>
                      </div>
                      <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-red-600">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm lg:text-base">Delete Account</p>
                          <p className="text-sm text-red-500">Permanently delete your account and data</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-4 text-sm lg:text-base">Developer Options</h4>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm lg:text-base">Debug Mode</p>
                        <p className="text-sm text-slate-600">Enable detailed logging</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-6 lg:w-11 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm lg:text-base">Beta Features</p>
                        <p className="text-sm text-slate-600">Access experimental features</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-6 lg:w-11 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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

      <div className="relative z-10 p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 text-base lg:text-lg">
            Manage your account preferences and configurations
          </p>
        </motion.div>

        {/* Mobile Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mb-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-2">
            <div className="grid grid-cols-3 gap-2">
              {tabs.slice(0, 3).map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl text-center transition-all duration-300 text-xs ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium leading-tight">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {tabs.slice(3).map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 3) * 0.1 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl text-center transition-all duration-300 text-xs ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium leading-tight">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-80 flex-shrink-0"
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
              <div className="p-4 lg:p-8">
                {renderTabContent()}
              </div>
              
              {/* Save Button */}
              {TABS_WITH_SAVE_BUTTON.includes(activeTab) && (
                <div className="flex items-center justify-end gap-4 p-4 lg:p-8 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 lg:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 lg:w-5 lg:h-5" />
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