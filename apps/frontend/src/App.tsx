import React, { useState, useEffect } from 'react';
import { getToken, decodeJwtPayload, clearTokens } from './api';
import Header from './components/Header';
import AuthSection from './components/AuthSection';
import LaboratoriesSection from './components/LaboratoriesSection';
import ReservationsSection from './components/ReservationsSection';
import NotificationsSection from './components/NotificationsSection';

interface User {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = getToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        setUser({
          email: payload.email || '',
          role: payload.role || 'USER',
          firstName: payload.firstName,
          lastName: payload.lastName,
        });
        setIsAuthenticated(true);
      }
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header 
        user={user} 
        isAuthenticated={isAuthenticated} 
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auth Section - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1">
            <AuthSection 
              isAuthenticated={isAuthenticated} 
              user={user}
              onLogin={handleLogin}
            />
          </div>

          {/* Main Content - 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {isAuthenticated && (
              <>
                <LaboratoriesSection isAuthenticated={isAuthenticated} />
                <ReservationsSection isAuthenticated={isAuthenticated} />
              </>
            )}
          </div>
        </div>

        {/* Notifications - Full width */}
        {isAuthenticated && (
          <div className="mt-6">
            <NotificationsSection 
              isAuthenticated={isAuthenticated}
              onUpdateUnreadCount={updateUnreadCount}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
