import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

    </div>
  );
};
