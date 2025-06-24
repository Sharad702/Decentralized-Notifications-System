import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, CheckCircle, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planId: string, price: string) => void;
  upgradingPlanId: string | null;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, upgradingPlanId }) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Pro Monthly',
      price: '0.1',
      priceDisplay: '0.1 ETH',
      triggers: 100,
      duration: 'month',
      features: ['100 triggers', '10 workflows', 'Email Support', 'Advanced Analytics'],
      cta: 'Upgrade to Monthly',
    },
    {
      id: 'bimonthly',
      name: 'Pro Bi-Monthly',
      price: '0.18',
      priceDisplay: '0.18 ETH',
      triggers: 250,
      duration: '2 months',
      features: ['250 triggers', '30 workflows', 'Priority Support', 'Advanced Analytics', 'Beta Features'],
      cta: 'Upgrade to Bi-Monthly',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 relative">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Upgrade Your Plan</h2>
                <p className="text-lg text-slate-600">Choose a plan that fits your needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-slate-200 rounded-2xl p-8 flex flex-col hover:border-blue-500 hover:shadow-xl transition-all">
                    <h3 className="text-2xl font-semibold text-slate-800 mb-2">{plan.name}</h3>
                    <p className="text-4xl font-bold text-slate-900 mb-2">{plan.priceDisplay}</p>
                    <p className="text-slate-500 mb-6">{`per ${plan.duration}`}</p>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => onUpgrade(plan.id, plan.price)}
                      disabled={!!upgradingPlanId}
                      className="mt-auto w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {upgradingPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        plan.cta
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal; 