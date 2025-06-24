import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Workflow, TrendingUp, CheckCircle, Zap, Target } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalWorkflows: number;
    totalExecutions: number;
    successRate: number;
    activeWorkflows: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows,
      icon: Workflow,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Executions',
      value: stats.totalExecutions.toLocaleString(),
      icon: Zap,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      change: '+24%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: Target,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      change: '+2%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Active Workflows',
      value: stats.activeWorkflows,
      icon: Activity,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-500',
      change: '+8%',
      changeColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, index) => {
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
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                    <span className={`text-sm font-semibold ${card.changeColor} flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
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
              
              {/* Progress Bar */}
              <div className="w-full bg-white/50 rounded-full h-2 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (typeof card.value === 'string' ? parseInt(card.value) : card.value) * 10)}%` }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                  className={`h-2 bg-gradient-to-r ${card.gradient} rounded-full shadow-sm`}
                ></motion.div>
              </div>
              
              <p className="text-xs text-slate-500 font-medium">
                vs last month
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardStats;