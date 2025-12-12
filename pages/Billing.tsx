import React, { useEffect, useState } from 'react';
import { getSubscriptionPlans, upgradePlan } from '../services/mockBackend';
import { SubscriptionPlan } from '../types';
import { Check, ShieldCheck, Zap, Crown } from 'lucide-react';

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
    const updated = await getSubscriptionPlans();
    setPlans(updated);
    setLoadingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Upgrade your Event Power
        </h2>
        <p className="text-slate-500 text-lg md:text-xl font-medium">
          Choose a plan that scales with your event needs. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isPremium = plan.id === 'premium';
          const isStandard = plan.id === 'standard';
          const isCurrent = plan.isCurrent;

          return (
            <div 
                key={plan.id} 
                className={`relative rounded-[2rem] p-8 flex flex-col transition-all duration-300 ${
                    isPremium 
                    ? 'bg-slate-900 text-white shadow-2xl scale-105 border border-slate-800 z-10' 
                    : isStandard
                        ? 'bg-white text-slate-900 shadow-xl border-2 border-blue-100 hover:border-blue-200 z-0'
                        : 'bg-white text-slate-900 shadow-lg border border-slate-200 hover:shadow-xl'
                }`}
            >
              {isPremium && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Crown size={12} fill="currentColor" /> Recommended
                 </div>
              )}

              <div className="mb-8">
                 <h3 className={`text-xl font-bold ${isPremium ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                 <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-slate-400">{plan.currency}</span>
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price.toLocaleString()}</span>
                    <span className={`text-sm font-medium ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
                 </div>
                 <p className={`text-sm mt-3 font-semibold px-3 py-1.5 rounded-lg inline-block ${
                     isPremium ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-600'
                 }`}>
                     {plan.limit}
                 </p>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${
                            isPremium ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium ${isPremium ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                    </div>
                ))}
              </div>

              <button
                disabled={isCurrent || loadingId === plan.id}
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                    isCurrent 
                    ? 'bg-emerald-500/10 text-emerald-500 cursor-default border border-emerald-500/20'
                    : isPremium 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/20' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {loadingId === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl shadow-inner border border-white/10">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h4 className="text-2xl font-bold mb-2">Enterprise Needs?</h4>
                    <p className="text-blue-100 leading-relaxed max-w-lg text-lg">
                        Running a festival with 10k+ attendees? We offer white-label solutions, dedicated on-site servers, and custom payment integrations.
                    </p>
                </div>
            </div>
            <button className="whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
                Contact Sales
            </button>
         </div>
      </div>
    </div>
  );
};