import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    return user.firstName || user.email.split('@')[0];
  };

  const getGreeting = () => {
    return `¡Bienvenido, ${getUserName()}!`;
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-sm relative z-20">
      {/* Left side: Mobile menu toggle & greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col text-left">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            {getGreeting()}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1 select-none">
            Aquí tienes un resumen de la actividad de laboratorios
          </p>
        </div>
      </div>

      {/* Right side: Tools */}
      <div className="flex items-center gap-4">
        {/* Bell Notification Button */}
        <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all duration-200 cursor-pointer border border-slate-100/60 shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
            3
          </span>
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[120px] truncate">
                {user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario UCE'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100/80 p-2 z-40 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-50 text-left">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario UCE'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="p-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
