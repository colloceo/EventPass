import React, { useEffect, useState } from 'react';
import { getStats, getEvents } from '../services/mockBackend';
import { Stats, Event } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Ticket, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const s = await getStats();
      const e = await getEvents();
      setStats(s);
      setRecentEvents(e.slice(0, 5));
    };
    fetchData();
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  const chartData = [
    { name: 'Sold', value: stats.totalTickets },
    { name: 'Used', value: stats.ticketsUsed },
    { name: 'Unused', value: stats.totalTickets - stats.ticketsUsed },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Overview of system performance and sales.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Total Tickets" 
          value={stats.totalTickets.toString()} 
          icon={Ticket} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Events" 
          value={stats.totalEvents.toString()} 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Check-ins" 
          value={stats.ticketsUsed.toString()} 
          icon={Users} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-6">Ticket Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Active Events</h3>
          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <p className="text-gray-500">No events created yet.</p>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-medium text-slate-800">{evt.name}</h4>
                    <p className="text-sm text-slate-500">{new Date(evt.date).toLocaleDateString()} • {evt.location}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">${evt.price}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
    </div>
  </div>
);