import React from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  LayoutDashboard, 
  Workflow, 
  BarChart3, 
  Settings, 
  Zap,
  Wallet,
  ChevronRight,
  FileText,
  Loader2
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  wallet: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  wallet,
  onConnectWallet,
  onDisconnectWallet
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'traders', label: 'Portfolio', icon: Wallet, isNew: true },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-700/50 z-50">
      {/* Logo */}
      <div className="p-8 border-b border-slate-700/50">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-30"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              BlockFlow
            </h1>
            <p className="text-xs text-slate-400 mt-1">Web3 Automation</p>
          </div>
        </motion.div>
      </div>

      {/* Wallet Connection */}
      <div className="p-6 border-b border-slate-700/50">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            if (!ready) {
              return (
                <div className="flex items-center justify-center bg-slate-800 rounded-2xl p-4 h-[116px]">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              );
            }

            if (connected) {
              return (
                <motion.div 
                  className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-4 border border-slate-600/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className='flex items-center gap-3'>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-400">Wallet Connected</span>
                      </div>
                      <button 
                        onClick={openAccountModal}
                        className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mb-2 bg-slate-900/50 px-3 py-2 rounded-lg">
                      {account.address?.slice(0, 8)}...{account.address?.slice(-6)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {account.displayBalance ? `${account.displayBalance} ETH` : '0 ETH'}
                      </span>
                      <Wallet className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={openConnectModal}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </motion.button>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.button
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-auto px-2 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-bold rounded-full">
                        📊
                      </span>
                    )}
                    {isActive && !item.isNew && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-700/50">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-2">
            BlockFlow v1.0.0
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;