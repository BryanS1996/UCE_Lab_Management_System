import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  user: { email: string; role: string; firstName?: string; lastName?: string } | null;
  isAuthenticated: boolean;
  unreadCount: number;
  onToggleNotifications: () => void;
  showNotifications: boolean;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isAuthenticated,
  unreadCount,
  onToggleNotifications,
  showNotifications,
}) => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
      <h1 className="text-2xl font-bold text-uce-navy">
        Panel de Control
      </h1>

      <div className="flex items-center gap-6">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>

        {/* Perfil de Usuario */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-tr from-uce-blue to-sky-400 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
              {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-800">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
