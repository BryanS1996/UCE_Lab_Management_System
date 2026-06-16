import React from 'react';
import { LayoutDashboard, Building2, CalendarClock, LogOut, Menu } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  onLogout,
  userEmail,
  userRole,
}) => {
  return (
    <aside
      className={`bg-uce-navy text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col shadow-xl z-20 relative`}
    >
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
        {isOpen && (
          <div className="flex flex-col">
            <span className="font-black text-xl text-white tracking-tight">UCE Labs</span>
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">
              Management
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-uce-blue text-white shadow-md'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Inicio</span>}
        </button>
        <button
          onClick={() => onTabChange('labs')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'labs'
              ? 'bg-uce-blue text-white shadow-md'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Building2 className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Laboratorios</span>}
        </button>
        <button
          onClick={() => onTabChange('reservations')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'reservations'
              ? 'bg-uce-blue text-white shadow-md'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <CalendarClock className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Mis Reservas</span>}
        </button>
      </nav>

      <div className="p-4 border-t border-white/10">
        {isOpen && (
          <div className="mb-4 px-4">
            <p className="text-xs text-white/60 truncate">{userEmail}</p>
            <p className="text-xs text-white/40 capitalize">{userRole}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
