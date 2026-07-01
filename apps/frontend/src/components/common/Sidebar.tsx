import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import uceLogo from '../../assets/uce_logo.png';
import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  CalendarDays,
  UserCheck,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
  FlaskConical,
  ChevronRight,
  Menu,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badgeKey?: 'notifications';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mapear el rol del usuario a una etiqueta amigable en español
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'DOCENTE':
        return 'Docente';
      case 'ESTUDIANTE':
        return 'Estudiante';
      default:
        return 'Usuario';
    }
  };

  const navItems: NavigationItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN'],
    },
    {
      path: '/laboratorios',
      label: 'Laboratorios',
      icon: Building2,
    },
    {
      path: '/reservas',
      label: 'Reservas',
      icon: CalendarDays,
      roles: ['ADMIN', 'DOCENTE'], // Estudiante hace reservas a través de labs/calendario
    },
    {
      path: '/calendario',
      label: 'Calendario',
      icon: CalendarRange,
    },
    {
      path: '/mis-reservas',
      label: 'Mis Reservas',
      icon: UserCheck,
      roles: ['ESTUDIANTE', 'DOCENTE'],
    },
    {
      path: '/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
      badgeKey: 'notifications',
    },
    {
      path: '/reportes',
      label: 'Reportes',
      icon: BarChart3,
      roles: ['ADMIN'],
    },
    {
      path: '/incidentes',
      label: 'Incidentes',
      icon: AlertTriangle,
    },
    {
      path: '/usuarios',
      label: 'Usuarios',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      path: '/configuracion',
      label: 'Configuración',
      icon: Settings,
      roles: ['ADMIN'],
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#0f172a] text-slate-300 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col h-screen border-r border-slate-800 shrink-0 z-30`}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <img src={uceLogo} alt="UCE Logo" className="w-7 h-7 object-contain" />
          </div>
          {isOpen && (
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-sm text-white tracking-tight leading-none">UCE Lab</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                Management
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle para colapsar en pantallas grandes */}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen ? (
                <span className="truncate">{item.label}</span>
              ) : (
                <span className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md border border-slate-800 z-50 whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Badges de notificación dummy según diseño */}
              {item.badgeKey === 'notifications' && (
                <span className={`
                  flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ml-auto
                  ${isOpen ? 'w-5 h-5' : 'w-2 h-2 absolute top-2.5 right-2.5'}
                  bg-blue-600 text-white
                `}>
                  {isOpen ? '3' : ''}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info / Profile Card at bottom */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0 select-none">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              {isOpen && (
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-sm font-semibold text-white truncate leading-tight">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario UCE'}
                  </span>
                  <span className="text-xs text-slate-400 truncate mt-0.5 leading-none">
                    {getRoleLabel(user.role)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                    <span className="text-[10px] text-slate-500">En línea</span>
                  </div>
                </div>
              )}
            </div>
            {isOpen && (
              <button
                onClick={handleLogoutClick}
                title="Cerrar Sesión"
                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {!isOpen && (
            <button
              onClick={handleLogoutClick}
              title="Cerrar Sesión"
              className="mt-3 w-full flex justify-center py-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
