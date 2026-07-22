import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../api';
import { BellRing, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; visible: boolean } | null>(null);

  // Controlar el comportamiento responsivo del Sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Ejecutar en montaje
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // WebSockets Connection
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Ensure WebSocket uses WSS if on HTTPS, or WS if on HTTP, by using protocol-relative or wss explicitly
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Let Nginx proxy /socket.io to the notification-service
    const wsUrl = `${protocol}//${window.location.host}/notifications`;

    const socket: Socket = io(wsUrl, {
      path: '/socket.io',
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to notifications websocket');
      // Extraemos user_id del payload del token de forma simple
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        socket.emit('register', payload.sub || payload.user_id);
      } catch (e) {
        console.error('Error decoding token for socket registration', e);
      }
    });

    socket.on('notification', (data: any) => {
      console.log('Real-time notification received:', data);
      setToast({
        title: data.title || 'Nueva Notificación',
        message: data.message || '',
        visible: true,
      });

      // Auto hide after 5 seconds
      setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
      
      {/* Overlay para móviles cuando el Sidebar está abierto */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-25 transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar de Navegación Lateral */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
        z-30 h-full transition-transform duration-300
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Barra de Navegación Superior */}
        <Navbar onToggleSidebar={toggleSidebar} />

        {/* Contenido de la Ruta Seleccionada (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-between">
            {/* Contenedor de la Vista Activa */}
            <div className="flex-grow pb-12 animate-fade-in">
              <Outlet />
            </div>

            {/* Footer de la Aplicación */}
            <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100 select-none">
              © 2026 UCE Lab Management System. Todos los derechos reservados.
            </footer>
          </div>
        </main>

      </div>

      {/* Floating Toast Notification for WebSockets */}
      <div 
        className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
          toast?.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white border-l-4 border-blue-500 shadow-xl rounded-lg p-4 flex items-start gap-4 min-w-[300px] max-w-sm">
          <div className="bg-blue-50 p-2 rounded-full text-blue-500 shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">{toast?.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{toast?.message}</p>
          </div>
          <button 
            onClick={() => setToast(prev => prev ? { ...prev, visible: false } : null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
