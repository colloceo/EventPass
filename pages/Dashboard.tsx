import React, { useEffect, useState } from 'react';
import { getStats, getEvents } from '../services/mockBackend';
import { Stats, Event } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Ticket, Activity, Calendar, ArrowUpRight, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [revenueCurrency, setRevenueCurrency] = useState<string>('USD');

  useEffect(() => {
    const fetchData = async () => {
      const s = await getStats();
      const allEvents = await getEvents();
      
      setStats(s);
      setRecentEvents(allEvents.slice(0, 5));

      if (allEvents.length > 0) {
        const currencies = new Set(allEvents.map(e => e.currency));
        if (currencies.size === 1) {
          setRevenueCurrency(allEvents[0].currency);
        } else {
          setRevenueCurrency('Mixed');
        }
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;

  // Mock data for the chart based on total tickets to make it look dynamic
  const baseValue = stats.totalTickets > 0 ? stats.totalTickets : 10;
  const chartData = [
    { name: 'Mon', sales: Math.floor(baseValue * 0.2) },
    { name: 'Tue', sales: Math.floor(baseValue * 0.4) },
    { name: 'Wed', sales: Math.floor(baseValue * 0.3) },
    { name: 'Thu', sales: Math.floor(baseValue * 0.6) },
    { name: 'Fri', sales: Math.floor(baseValue * 0.8) },
    { name: 'Sat', sales: Math.floor(baseValue * 0.5) },
    { name: 'Sun', sales: baseValue },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
           <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your events today.</p>
        </div>
        <button className="bg-white hover:bg-gray-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" /> 
            <span>Last 7 Days</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={revenueCurrency === 'Mixed' ? `~ ${stats.revenue.toLocaleString()}` : `${revenueCurrency} ${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="12.5%"
          trendUp={true}
        />
        <StatCard 
          title="Tickets Sold" 
          value={stats.totalTickets.toString()} 
          icon={Ticket} 
          trend="8.2%"
          trendUp={true}
        />
        <StatCard 
          title="Check-ins" 
          value={stats.ticketsUsed.toString()} 
          icon={Users} 
          trend="2.1%"
          trendUp={false}
        />
         <StatCard 
          title="Active Events" 
          value={stats.totalEvents.toString()} 
          icon={Activity} 
          trend="Stable"
          trendUp={true}
          isNeutral
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Ticket Sales Trend</h3>
                <p className="text-sm text-slate-400">Daily sales performance over the last week</p>
             </div>
             <div className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sales Volume</span>
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                />
                <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Events</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[300px] xl:max-h-none">
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                 <Calendar size={32} className="mb-2 opacity-30" />
                 <p className="text-sm">No active events found</p>
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold uppercase text-slate-400">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-slate-800 leading-none">{new Date(evt.date).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors">{evt.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{evt.location}</p>
                    </div>
                  </div>
                  <div className="text-right pl-2 flex-shrink-0">
                     <span className="block text-sm font-bold text-slate-900">{evt.currency} {evt.price}</span>
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 mt-1">
                        Active
                     </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100">
             <button className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-2">
                <Activity size={16} /> View Performance Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, isNeutral }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all duration-300">
     <div className="flex justify-between items-start z-10">
        <div>
           <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
           <h4 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">{value}</h4>
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm`}>
           <Icon size={20} />
        </div>
     </div>
     
     <div className="flex items-center gap-2 mt-4 z-10">
        {isNeutral ? (
             <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                 <span>Stable</span>
             </div>
        ) : (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trendUp ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-90" />} 
                {trend}
            </div>
        )}
        <span className="text-xs text-slate-400">vs last month</span>
     </div>

     {/* Decorative gradient blob */}
     <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0 pointer-events-none" />
  </div>
);