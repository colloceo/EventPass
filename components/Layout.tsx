import React from 'react';
import { LayoutDashboard, CalendarPlus, Ticket, ScanLine, CreditCard, LogOut, User } from 'lucide-react';
import { Onboarding } from './Onboarding';

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
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative">
      {/* Onboarding Tour */}
      <Onboarding />

      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white flex-shrink-0 hidden md:flex flex-col border-r border-slate-800 shadow-xl z-20">
        <div className="p-8 pb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Ticket className="text-white" size={18} strokeWidth={3} />
            </div>
            EventPass
          </h1>
          <p className="text-xs text-slate-500 font-medium ml-11 mt-1 uppercase tracking-wider">Business Admin</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-item-${item.id}`} // Unique ID for Onboarding target
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${currentPage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 mt-auto border-t border-slate-800/50">
            <div className="bg-slate-800/30 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    JD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">John Doe</p>
                    <p className="text-xs text-slate-400 truncate">Organizer</p>
                </div>
                <LogOut size={16} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 w-full bg-[#0F172A]/90 backdrop-blur-md text-white z-50 px-4 py-3 flex justify-between items-center border-b border-slate-800">
         <span className="font-bold flex items-center gap-2 text-lg">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Ticket className="text-white" size={16} strokeWidth={3} />
            </div>
            EventPass
         </span>
         <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            {navItems.slice(0, 4).map(item => (
                <button 
                    key={item.id} 
                    id={`mobile-nav-item-${item.id}`} // Unique ID for Onboarding target (mobile)
                    onClick={() => onNavigate(item.id)} 
                    className={`p-2 rounded-md transition-colors ${currentPage === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
                >
                    <item.icon size={20} />
                </button>
            ))}
             <button 
                onClick={() => onNavigate('billing')} 
                className={`p-2 rounded-md transition-colors ${currentPage === 'billing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}
            >
                <CreditCard size={20} />
            </button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-auto mt-16 md:mt-0 custom-scrollbar">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};