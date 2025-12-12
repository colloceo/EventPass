import React, { useEffect, useState } from 'react';
import { getStats, getEvents } from '../services/mockBackend';
import { Stats, Event } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Ticket, Activity, Calendar, ArrowUpRight, Wallet, PieChart, TrendingUp } from 'lucide-react';

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
        setRevenueCurrency(allEvents[0].currency);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="p-12 text-center text-slate-400 font-medium">Loading analytics...</div>;

  // Mock data for the chart
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
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
           <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" /> 
                <span>Last 30 Days</span>
            </button>
             <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
                <TrendingUp size={16} /> 
                <span>Reports</span>
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Earnings (Premium Card) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={80} />
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">Net Earnings</p>
                <h3 className="text-3xl font-bold tracking-tight">{revenueCurrency} {stats.netRevenue.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 mt-1">Profit after platform fees</p>
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-2">
                 <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ArrowUpRight size={12} /> 15.2%
                 </div>
                 <span className="text-xs text-slate-500">vs last month</span>
            </div>
        </div>

        {/* Gross Sales */}
        <StatCard 
          title="Gross Sales" 
          value={`${revenueCurrency} ${stats.grossSales.toLocaleString()}`} 
          icon={DollarSign} 
          trend="12.5%"
          trendUp={true}
          color="blue"
        />

        <StatCard 
          title="Tickets Sold" 
          value={stats.totalTickets.toString()} 
          icon={Ticket} 
          trend="8.2%"
          trendUp={true}
          color="indigo"
        />
        
        <StatCard 
          title="Active Check-ins" 
          value={stats.ticketsUsed.toString()} 
          icon={Users} 
          trend="2.1%"
          trendUp={false}
          isNeutral
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Trajectory</h3>
                <p className="text-sm text-slate-400 font-medium">Daily financial performance over time</p>
             </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                />
                <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                />
                <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fees & Recent */}
        <div className="flex flex-col gap-6">
            {/* Fees Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Platform Fees</p>
                        <h4 className="text-2xl font-bold text-slate-900">{revenueCurrency} {stats.totalFeesCollected.toLocaleString()}</h4>
                    </div>
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                        <PieChart size={20} />
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full w-[15%]"></div>
                </div>
                <p className="text-xs text-slate-400">5% Platform commission collected</p>
            </div>

            {/* Recent Events List */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Events</h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {recentEvents.map((evt) => (
                        <div key={evt.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-blue-700">{evt.name}</h4>
                            <p className="text-xs text-slate-400 truncate font-medium">{new Date(evt.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right pl-3">
                            <span className="block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{evt.currency} {evt.price}</span>
                        </div>
                        </div>
                    ))}
                    {recentEvents.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-4">No events created yet.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, isNeutral, description, color = 'blue' }: any) => {
    const colorStyles: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
        orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h4>
                </div>
                <div className={`p-3 rounded-xl transition-colors duration-300 ${colorStyles[color]}`}>
                <Icon size={22} />
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
                {isNeutral ? (
                    <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                        <span>Stable</span>
                    </div>
                ) : (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trendUp ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-90" />} 
                        {trend}
                    </div>
                )}
                <span className="text-xs text-slate-400 font-medium">vs last month</span>
            </div>
        </div>
    );
};