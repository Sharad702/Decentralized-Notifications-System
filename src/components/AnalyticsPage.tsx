import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Target,
  Users,
  DollarSign
} from 'lucide-react';

interface AnalyticsPageProps {
  workflows: any[];
  onRefresh: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ workflows, onRefresh }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'executions' | 'success' | 'performance'>('executions');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const handleRefresh = () => {
    console.log('Reloading analytics data...');
    onRefresh();
  };

  // Calculate analytics data
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
  const avgSuccessRate = Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length) || 0;
  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const totalWorkflows = workflows.length;

  // Aggregate all executions from all workflows
  const allExecutions = workflows.flatMap(w => (w.executionTimestamps || []).map((ts: string) => ({ ts, workflow: w })));
  const executionsByDay: Record<string, number> = {};

  allExecutions.forEach(exec => {
    const day = new Date(exec.ts).toISOString().split('T')[0];
    executionsByDay[day] = (executionsByDay[day] || 0) + 1;
  });

  // Build sorted array for the chart
  const executionTrend: { date: string; executions: number }[] = Object.entries(executionsByDay)
    .map(([date, executions]) => ({ date, executions: Number(executions) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExport = () => {
    const dataToExport = workflows.map(w => ({
      ID: w.id,
      'Account Address': w.userAddress,
      Name: w.name,
      'Trigger Type': w.triggerType,
      'Action Type': w.actionType,
      'Is Active': w.isActive,
      'Execution Count': w.executionCount,
      'Success Rate': w.successRate,
      'Created At': w.createdAt,
      'Last Triggered': w.lastTriggered || 'N/A',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blockflow-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const workflowPerformance = workflows.map(w => ({
    name: w.name,
    executions: w.executionCount,
    successRate: w.successRate,
    type: w.triggerType
  })).sort((a, b) => b.executions - a.executions);

  const triggerTypeDistribution = [
    { type: 'ETH Transfer', count: workflows.filter(w => w.triggerType === 'eth_transfer').length, color: 'bg-blue-500' },
    { type: 'NFT Purchase', count: workflows.filter(w => w.triggerType === 'nft_purchase').length, color: 'bg-purple-500' },
    { type: 'Contract Event', count: workflows.filter(w => w.triggerType === 'contract_event').length, color: 'bg-green-500' }
  ];

  const kpiCards = [
    {
      title: 'Total Executions',
      value: totalExecutions.toLocaleString(),
      change: '+24%',
      changeType: 'positive' as const,
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Success Rate',
      value: `${avgSuccessRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Target,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Active Workflows',
      value: activeWorkflows.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Activity,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Avg Response Time',
      value: '1.2s',
      change: '-0.3s',
      changeType: 'positive' as const,
      icon: Clock,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Analytics
              </h1>
              <p className="text-slate-600 text-lg">
                Monitor performance and insights for your workflows
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm`}
              >
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        {card.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-slate-900">
                          {card.value}
                        </p>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${
                          card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {card.change}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl blur-lg opacity-30`}></div>
                      <div className={`relative p-4 bg-gradient-to-r ${card.gradient} rounded-2xl shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-medium">
                    vs previous period
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Execution Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Execution Trend</h3>
                <p className="text-slate-600 text-sm">Daily workflow executions over time</p>
              </div>
              <LineChart className="w-8 h-8 text-blue-500" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 relative">
              {executionTrend.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center relative"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === index && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                      <div>API Calls: <span className="font-bold">{day.executions}</span></div>
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(Number(day.executions) / 84) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 min-h-[20px]"
                  ></motion.div>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trigger Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Trigger Types</h3>
                <p className="text-slate-600 text-sm">Distribution of workflow triggers</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-500" />
            </div>
            
            <div className="space-y-4">
              {triggerTypeDistribution.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <span className="font-medium text-slate-900">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / totalWorkflows) * 100}%` }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                        className={`h-2 rounded-full ${item.color}`}
                      ></motion.div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Workflow Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Workflow Performance</h3>
                <p className="text-slate-600 text-sm">Top performing workflows by execution count</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left p-6 text-sm font-semibold text-slate-600 uppercase tracking-wider">Workflow</th>
                  <th className="text-left p-6 text-sm font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="text-left p-6 text-sm font-semibold text-slate-600 uppercase tracking-wider">Executions</th>
                  <th className="text-left p-6 text-sm font-semibold text-slate-600 uppercase tracking-wider">Success Rate</th>
                  <th className="text-left p-6 text-sm font-semibold text-slate-600 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody>
                {workflowPerformance.slice(0, 5).map((workflow, index) => (
                  <motion.tr
                    key={workflow.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-slate-200/50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-6">
                      <div className="font-semibold text-slate-900">{workflow.name}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {workflow.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-semibold text-slate-900">{Number(workflow.executions || 0).toLocaleString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${workflow.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{workflow.successRate}%</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {workflow.successRate >= 95 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : workflow.successRate >= 80 ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          workflow.successRate >= 95 ? 'text-green-600' :
                          workflow.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {workflow.successRate >= 95 ? 'Excellent' :
                           workflow.successRate >= 80 ? 'Good' : 'Needs Attention'}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;