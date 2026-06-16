import React, { useState, useEffect } from 'react';
import { endpoints } from '../api';

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsSectionProps {
  isAuthenticated: boolean;
  onUpdateUnreadCount: (count: number) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ isAuthenticated, onUpdateUnreadCount }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await endpoints.notificationMy() as Notification[];
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
      onUpdateUnreadCount(unread);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await endpoints.notificationUnread() as number;
      setUnreadCount(count);
      onUpdateUnreadCount(count);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INFO':
        return 'ℹ️';
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      default:
        return '📢';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-uce-navy">Notificaciones</h2>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
              {unreadCount} no leídas
            </span>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-uce-blue rounded-md hover:bg-uce-purple transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {notifications.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay notificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-900 font-medium">{notification.message}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {!notification.read && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                      Nuevo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
