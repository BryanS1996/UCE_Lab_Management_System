import React, { useState, useEffect } from 'react';
import { Activity, Building2, Clock } from 'lucide-react';
import AuthSection from './components/AuthSection';
import LaboratoriesSection from './components/LaboratoriesSection';
import ReservationsSection from './components/ReservationsSection';
import NotificationsSection from './components/NotificationsSection';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, labs, reservations
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Verificamos si ya hay sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUserEmail(localStorage.getItem('email') || 'usuario@uce.edu.ec');
      setUserRole('STUDENT');
    }
  }, []);

  // Detectar pantalla móvil para colapsar sidebar automáticamente
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = (userData: { email: string; role: string; firstName?: string; lastName?: string }) => {
    // El token ya es manejado por setTokens en AuthSection
    localStorage.setItem('email', userData.email);
    setIsAuthenticated(true);
    setUserEmail(userData.email);
    setUserRole(userData.role);
    setUserFirstName(userData.firstName || '');
    setUserLastName(userData.lastName || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserFirstName('');
    setUserLastName('');
  };

  // --- MÓDULO QUEMADO: INICIO / DASHBOARD ---
  const renderDashboardMetrics = () => (
    <div className="space-y-6 fade-in">
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Horas de uso este mes</p>
            <h4 className="text-2xl font-bold text-gray-900">24h</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Building2 className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Laboratorio Favorito</p>
            <h4 className="text-lg font-bold text-gray-900 leading-tight">Lab. Computación 38</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Clock className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Próxima Reserva</p>
            <h4 className="text-lg font-bold text-gray-900 leading-tight">Mañana, 09:00 AM</h4>
          </div>
        </div>
      </div>

      {/* Panel de Anuncios */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Anuncios de la Facultad</h3>
        <div className="space-y-4">
          <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
            <div>
              <p className="font-semibold text-gray-900">Mantenimiento de Servidores</p>
              <p className="text-sm text-gray-600 mt-1">El laboratorio 12 estará cerrado por actualización de tarjetas gráficas este fin de semana. Por favor, reubiquen sus reservas al Lab 16.</p>
              <p className="text-xs text-gray-400 mt-2">Hace 2 horas</p>
            </div>
          </div>
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-gray-400 shrink-0"></div>
            <div>
              <p className="font-semibold text-gray-900">Nuevos equipos disponibles</p>
              <p className="text-sm text-gray-600 mt-1">Se han instalado 10 nuevas workstations en la Sala de Innovación y Coworking.</p>
              <p className="text-xs text-gray-400 mt-2">Hace 2 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <AuthSection
          isAuthenticated={isAuthenticated}
          user={userEmail ? { email: userEmail, role: userRole } : null}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // --- RENDER DEL DASHBOARD PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900 relative">
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        userEmail={userEmail}
        userRole={userRole}
      />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <Header
          user={userEmail ? { email: userEmail, role: userRole, firstName: userFirstName, lastName: userLastName } : null}
          isAuthenticated={isAuthenticated}
          unreadCount={unreadNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
        />

        {/* Panel de notificaciones */}
        {showNotifications && (
          <div className="absolute right-8 top-24 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <NotificationsSection 
              isAuthenticated={isAuthenticated} 
              onUpdateUnreadCount={setUnreadNotifications} 
            />
          </div>
        )}

        {/* CONTENIDO DINÁMICO (Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && renderDashboardMetrics()}
            {activeTab === 'labs' && <LaboratoriesSection isAuthenticated={isAuthenticated} />}
            {activeTab === 'reservations' && <ReservationsSection isAuthenticated={isAuthenticated} />}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default App;