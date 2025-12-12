import React from 'react';
import { LayoutDashboard, CalendarPlus, Ticket, ScanLine, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-event', label: 'Create Event', icon: CalendarPlus },
    { id: 'generate-ticket', label: 'Issue Ticket', icon: Ticket },
    { id: 'scanner', label: 'Scanner', icon: ScanLine },
    { id: 'docs', label: 'System Docs', icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="text-blue-400" /> EventPass
          </h1>
          <p className="text-xs text-slate-400 mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          v1.0.0 Production Build
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
         <span className="font-bold flex gap-2"><Ticket /> EventPass</span>
         <div className="flex gap-4">
            {navItems.map(item => (
                <button key={item.id} onClick={() => onNavigate(item.id)} className={currentPage === item.id ? 'text-blue-400' : 'text-gray-400'}>
                    <item.icon size={20} />
                </button>
            ))}
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto mt-14 md:mt-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};