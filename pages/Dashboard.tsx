import React, { useEffect, useState } from 'react';
import { getStats, getEvents } from '../services/mockBackend';
import { Stats, Event } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Ticket, Activity, Calendar, ArrowUpRight, ArrowRight, Wallet, PieChart } from 'lucide-react';

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
        // Simple logic to show the currency of the most recent event or default
        setRevenueCurrency(allEvents[0].currency);
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
           <p className="text-slate-500 mt-1">Track your event sales and earnings.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white hover:bg-gray-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" /> 
                <span>Last 30 Days</span>
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Net Earnings (Organizer Profit) */}
        <StatCard 
          title="Net Earnings" 
          value={`${revenueCurrency} ${stats.netRevenue.toLocaleString()}`} 
          icon={Wallet} 
          trend="15.2%"
          trendUp={true}
          description="After fees"
          highlight
        />

        {/* Gross Sales */}
        <StatCard 
          title="Gross Sales" 
          value={`${revenueCurrency} ${stats.grossSales.toLocaleString()}`} 
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
          isNeutral
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
                <p className="text-sm text-slate-400">Daily financial performance</p>
             </div>
             <div className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Net Earnings</span>
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fees Info / Recent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col">
          <div className="mb-6 pb-6 border-b border-slate-100">
             <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Fees</h3>
             <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Total Collected</p>
                    <p className="text-xl font-bold text-slate-700">{revenueCurrency} {stats.totalFeesCollected.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm text-slate-400">
                    <PieChart size={20} />
                </div>
             </div>
             <p className="text-xs text-slate-400 mt-2">Fees are deducted automatically via the payment gateway.</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Events</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[250px] xl:max-h-none">
            {recentEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{evt.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{new Date(evt.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right pl-2">
                     <span className="block text-xs font-bold text-emerald-600">{evt.currency} {evt.price}</span>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, isNeutral, description, highlight }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all duration-300 ${highlight ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/60'}`}>
     <div className="flex justify-between items-start z-10">
        <div>
           <p className={`text-sm font-medium mb-1 ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
           <h4 className={`text-2xl lg:text-3xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</h4>
           {description && <p className={`text-xs mt-1 ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>}
        </div>
        <div className={`p-2.5 rounded-xl transition-colors duration-300 shadow-sm ${highlight ? 'bg-slate-800 text-emerald-400' : 'bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
           <Icon size={20} />
        </div>
     </div>
     
     <div className="flex items-center gap-2 mt-4 z-10">
        {isNeutral ? (
             <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                 <span>Stable</span>
             </div>
        ) : (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? (highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : 'bg-rose-50 text-rose-600'}`}>
                {trendUp ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-90" />} 
                {trend}
            </div>
        )}
        <span className={`text-xs ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>vs last month</span>
     </div>
  </div>
);