import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  DollarSign,
  Target,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  MoreVertical,
  Eye,
  Star,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Layers,
  Settings,
  Bell,
  Crown,
  Sparkles,
  Percent,
  TrendingUp as TrendUp,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Edit3,
  Trash2
} from 'lucide-react';
import CreatePortfolioAlertModal from './CreatePortfolioAlertModal';

interface TradersPageProps {
  onCreateWorkflow: (workflow: any) => void;
  onWorkflowsChanged: () => void;
}

const TradersPage: React.FC<TradersPageProps> = ({ onCreateWorkflow, onWorkflowsChanged }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'alerts' | 'analytics'>('portfolio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);

  // Portfolio state from API
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoadingPortfolio(true);
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        setPortfolio(data.portfolio);
      } catch (e) {
        setPortfolio([]);
      }
      setLoadingPortfolio(false);
    }
    fetchPortfolio();
   // Optionally, poll every minute:
    const interval = setInterval(fetchPortfolio, 60000);
    return () => clearInterval(interval);
  }, []);

  // Portfolio alerts state from API
  const [portfolioAlerts, setPortfolioAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Fetch alerts from backend
  useEffect(() => {
    async function fetchAlerts() {
      setLoadingAlerts(true);
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        setPortfolioAlerts(data);
      } catch (e) {
        setPortfolioAlerts([]);
      }
      setLoadingAlerts(false);
    }
    fetchAlerts();
  }, []);

  // Remove hardcoded portfolioStats and compute dynamically
  const totalValue = portfolio.reduce((sum, asset) => sum + Number(asset.value), 0);
  const dayChange = portfolio.reduce((sum, asset) => sum + Number(asset.priceChange24h), 0);
  const dayChangePercent = totalValue !== 0 ? ((dayChange / (totalValue - dayChange)) * 100) : 0;
  const topPerformer = portfolio.reduce((top, asset) => (Number(asset.percentChange24h) > Number(top.percentChange24h) ? asset : top), portfolio[0] || { symbol: '', percentChange24h: '-999' });
  const worstPerformer = portfolio.reduce((worst, asset) => (Number(asset.percentChange24h) < Number(worst.percentChange24h) ? asset : worst), portfolio[0] || { symbol: '', percentChange24h: '999' });
  const alertsActive = portfolioAlerts.filter(a => a.status === 'active').length;
  const alertsTriggered = portfolioAlerts.filter(a => a.status === 'triggered').length;

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'alerts', label: 'Portfolio Alerts', icon: Bell },
    { id: 'analytics', label: 'Performance', icon: BarChart3 }
  ];

  // Create alert via backend
  const handleCreatePortfolioAlert = async (newAlert: any) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      const created = await res.json();
      setPortfolioAlerts(prev => [...prev, created]);
      // Optionally, trigger workflow creation as before
      const workflow = {
        id: Date.now().toString(),
        name: created.name,
        description: created.description,
        triggerType: 'portfolio_alert',
        actionType: created.actionType,
        sourceAddress: '0x742d35Cc6635C0532925a3b8D42ff8D91f4d0bC0',
        actionParams: created.actionParams,
        isActive: true,
        executionCount: 0,
        successRate: 100,
        createdAt: new Date(),
        portfolioAlert: created,
        portfolioAlertId: created.id // Link workflow to alert
      };
      onCreateWorkflow(workflow);
      onWorkflowsChanged(); // Refetch workflows after alert creation
    } catch (e) {
      // handle error
    }
  };

  // Toggle alert status via backend
  const handleToggleAlert = async (id: string) => {
    const alert = portfolioAlerts.find(a => a.id === id);
    if (!alert) return;
    const newStatus = alert.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setPortfolioAlerts(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e) {
      // handle error
    }
  };

  // Delete alert via backend
  const handleDeleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      setPortfolioAlerts(prev => prev.filter(a => a.id !== id));
      onWorkflowsChanged(); // Refetch workflows after alert deletion
    } catch (e) {
      // handle error
    }
  };

  // Calculate week change dynamically if possible, otherwise hide the card
  // For now, remove the Week Change card if not available
  const statCards = [
    {
      label: 'Total Portfolio Value',
      value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: `${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`,
      changeValue: `${dayChange >= 0 ? '+' : ''}$${dayChange.toFixed(2)}`,
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'Day Change',
      value: `${dayChange >= 0 ? '+' : ''}$${dayChange.toFixed(2)}`,
      change: `${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'green'
    },
    // Week Change card removed
    {
      label: 'Active Alerts',
      value: alertsActive.toString(),
      change: `${alertsTriggered} triggered`,
      icon: Bell,
      color: 'orange'
    }
  ];

  const renderPortfolioTab = () => (
    <div className="space-y-8">
      {loadingPortfolio ? (
        <div className="text-center py-10 text-lg text-slate-500">Loading portfolio...</div>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {stat.change && (
                      <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    {stat.changeValue && (
                      <p className="text-sm text-slate-600 mt-1">{stat.changeValue}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Portfolio Holdings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-500" />
                  Portfolio Holdings
                </h3>
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCreateAlertModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center gap-2 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Alert
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Asset</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Value</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Price</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">24h Change</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Allocation</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Alerts</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {portfolio.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Wallet className="w-12 h-12 text-blue-400 mb-4" />
                          <h4 className="text-xl font-bold text-slate-700 mb-2">No holdings found</h4>
                          <p className="text-slate-500 mb-4">Your portfolio is empty. Add assets to see them here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    portfolio.map((holding, index) => (
                      <motion.tr
                        key={holding.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{holding.token}</p>
                              <p className="text-sm text-slate-600">{holding.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">{holding.amount}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">${holding.value}</p>
                          <p className={`text-sm ${Number(holding.priceChange24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                            {Number(holding.priceChange24h) >= 0 ? '+' : ''}${holding.priceChange24h}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">{holding.price}</p>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-1 ${Number(holding.percentChange24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                            {Number(holding.percentChange24h) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            <span className="font-semibold">{holding.percentChange24h}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${holding.allocation}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{holding.allocation}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {holding.alerts.map((alert: any, i: number) => (
                              <span
                                key={i}
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  alert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {alert.type.replace('_', ' ')}
                              </span>
                            ))}
                            {holding.alerts.length === 0 && (
                              <span className="text-sm text-slate-400">No alerts</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setShowCreateAlertModal(true)}
                              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-8">
      {/* Alert Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { type: 'portfolio_value', label: 'Portfolio Value', icon: DollarSign, color: 'blue', count: portfolioAlerts.filter(a => a.type === 'portfolio_value').length },
          { type: 'price_target', label: 'Price Targets', icon: Target, color: 'green', count: portfolioAlerts.filter(a => a.type === 'price_target').length },
          { type: 'stop_loss', label: 'Stop Loss', icon: AlertTriangle, color: 'red', count: portfolioAlerts.filter(a => a.type === 'stop_loss').length },
          { type: 'daily_summary', label: 'Daily Summary', icon: Clock, color: 'purple', count: portfolioAlerts.filter(a => a.type === 'daily_summary').length }
        ].map((alertType, index) => {
          const Icon = alertType.icon;
          return (
            <motion.div
              key={alertType.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">{alertType.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{alertType.count}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${alertType.color}-100 text-${alertType.color}-600`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Portfolio Alerts List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-500" />
              Portfolio Alerts
            </h3>
            <button
              onClick={() => setShowCreateAlertModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-400 hover:to-red-400 transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Alert
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-200/50">
          {portfolioAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bell className="w-12 h-12 text-orange-400 mb-4" />
              <h4 className="text-xl font-bold text-slate-700 mb-2">No alerts configured</h4>
              <p className="text-slate-500 mb-4">Create your first portfolio alert to get notified about important changes.</p>
              <button
                onClick={() => setShowCreateAlertModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-400 hover:to-red-400 transition-all duration-300 font-semibold"
              >
                Create Your First Alert
              </button>
            </div>
          ) : (
            portfolioAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{alert.name}</h4>
                        {alert.status === 'active' && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">active</span>
                        )}
                        {alert.lastTriggered && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">triggered</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span><strong>Threshold:</strong> {alert.threshold}</span>
                        {alert.lastTriggered && (
                          <span><strong>Last Triggered:</strong> {alert.lastTriggered}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleAlert(alert.id)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      {alert.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Best Performer', value: topPerformer.symbol, icon: TrendingUp, color: 'green' },
          { label: 'Worst Performer', value: worstPerformer.symbol, icon: TrendingDown, color: 'red' },
          { label: 'Week Performance', value: 'N/A', icon: BarChart3, color: 'blue' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-500" />
            Portfolio Value Trend
          </h4>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
            <p className="text-slate-600">Portfolio value chart would go here</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            Asset Allocation
          </h4>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center">
            <p className="text-slate-600">Asset allocation chart would go here</p>
          </div>
        </div>
      </div>

      {/* Alert Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Alert Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm font-semibold text-green-700 mb-1">Successful Alerts</p>
            <p className="text-2xl font-bold text-green-800">24</p>
            <p className="text-xs text-green-600">This month</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-semibold text-blue-700 mb-1">Average Response Time</p>
            <p className="text-2xl font-bold text-blue-800">1.2s</p>
            <p className="text-xs text-blue-600">Real-time alerts</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-sm font-semibold text-purple-700 mb-1">Profit from Alerts</p>
            <p className="text-2xl font-bold text-purple-800">+$2,450</p>
            <p className="text-xs text-purple-600">This month</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio': return renderPortfolioTab();
      case 'alerts': return renderAlertsTab();
      case 'analytics': return renderAnalyticsTab();
      default: return renderPortfolioTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <Wallet className="w-10 h-10 text-blue-500" />
                Portfolio Monitor
              </h1>
              <p className="text-slate-600 text-lg">
                Track your crypto portfolio and get intelligent alerts based on your holdings
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateAlertModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Portfolio Alert
            </motion.button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '📊', title: 'Portfolio Tracking', desc: 'Real-time portfolio monitoring' },
              { icon: '🎯', title: 'Price Targets', desc: 'Set custom price alerts' },
              { icon: '🛡️', title: 'Stop Loss Alerts', desc: 'Protect your investments' },
              { icon: '📈', title: 'Performance Analytics', desc: 'Track portfolio performance' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 border border-slate-200/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Create Portfolio Alert Modal */}
        <CreatePortfolioAlertModal
          isOpen={showCreateAlertModal}
          onClose={() => setShowCreateAlertModal(false)}
          onSubmit={handleCreatePortfolioAlert}
          portfolio={portfolio}
        />
      </div>
    </div>
  );
};

export default TradersPage;