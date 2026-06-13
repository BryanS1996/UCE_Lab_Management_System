import React from 'react';

interface HeaderProps {
  user: { email: string; role: string; firstName?: string; lastName?: string } | null;
  isAuthenticated: boolean;
  unreadCount: number;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isAuthenticated, unreadCount, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-uce-navy">UCE Lab Management</h1>
            </div>
          </div>

          {/* User Info and Notifications */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button className="p-2 rounded-full text-gray-600 hover:text-uce-blue hover:bg-gray-100">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-uce-blue flex items-center justify-center text-white font-semibold">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-uce-purple rounded-md hover:bg-uce-blue transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
