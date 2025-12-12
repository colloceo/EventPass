import React, { useEffect, useState } from 'react';
import { getSubscriptionPlans, upgradePlan } from '../services/mockBackend';
import { SubscriptionPlan } from '../types';
import { Check, ShieldCheck, Zap, Star } from 'lucide-react';

export const Billing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlans().then(setPlans);
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoadingId(planId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await upgradePlan(planId);
    
    // Refresh plans
    const updated = await getSubscriptionPlans();
    setPlans(updated);
    setLoadingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Upgrade your Event Power</h2>
        <p className="text-slate-500 mt-2 text-lg">Choose a plan that scales with your event needs. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => {
          const isPremium = plan.id === 'premium';
          const isCurrent = plan.isCurrent;

          return (
            <div 
                key={plan.id} 
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                    isPremium 
                    ? 'bg-slate-900 text-white shadow-xl scale-105 border border-slate-800 z-10' 
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md'
                }`}
            >
              {isPremium && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                    Recommended
                 </div>
              )}

              <div className="mb-6">
                 <h3 className={`text-lg font-bold ${isPremium ? 'text-blue-400' : 'text-slate-500'}`}>{plan.name}</h3>
                 <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight">{plan.currency} {plan.price.toLocaleString()}</span>
                    <span className={`ml-2 text-sm font-medium ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
                 </div>
                 <p className={`text-sm mt-2 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>{plan.limit}</p>
              </div>

              <button
                disabled={isCurrent || loadingId === plan.id}
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full py-3 rounded-xl font-bold text-sm mb-8 transition-all ${
                    isCurrent 
                    ? 'bg-emerald-500/10 text-emerald-500 cursor-default border border-emerald-500/20'
                    : isPremium 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                {loadingId === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade Plan'}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full ${isPremium ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${isPremium ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                    </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-start gap-4">
             <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                 <ShieldCheck size={24} />
             </div>
             <div>
                 <h4 className="text-lg font-bold text-slate-900">Enterprise Needs?</h4>
                 <p className="text-slate-600 max-w-md mt-1">
                     Running a festival with 10k+ attendees? We offer white-label solutions, dedicated on-site servers, and custom payment integrations.
                 </p>
             </div>
         </div>
         <button className="whitespace-nowrap bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold py-3 px-6 rounded-xl transition-colors">
             Contact Sales
         </button>
      </div>
    </div>
  );
};