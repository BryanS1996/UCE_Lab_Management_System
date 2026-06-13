import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, CalendarClock, LogOut, Menu, Bell, Activity, Clock } from 'lucide-react';
import AuthSection from './components/AuthSection';
import LaboratoriesSection from './components/LaboratoriesSection';
import ReservationsSection from './components/ReservationsSection';
import NotificationsSection from './components/NotificationsSection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, labs, reservations
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Verificamos si ya hay sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUserEmail(localStorage.getItem('email') || 'usuario@uce.edu.ec');
      setUserRole('STUDENT');
    }
  }, []);

  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUserEmail('');
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <AuthSection onLogin={handleLogin} />
      </div>
    );
  }

  // --- RENDER DEL DASHBOARD PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900">
      {/* 1. SIDEBAR (Navegación Lateral) */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-sm z-20 relative`}>
        <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100">
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-xl text-blue-700 tracking-tight">UCE Labs</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Management</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Inicio</span>}
          </button>
          <button 
            onClick={() => setActiveTab('labs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'labs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Building2 className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Laboratorios</span>}
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'reservations' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <CalendarClock className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Mis Reservas</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* CABECERA (Header) */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Panel de Control'}
            {activeTab === 'labs' && 'Catálogo de Laboratorios'}
            {activeTab === 'reservations' && 'Mis Reservaciones'}
          </h1>
          
          <div className="flex items-center gap-6">
            {/* Notificaciones (Usa tu componente real) */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <NotificationsSection isAuthenticated={isAuthenticated} />
                </div>
              )}
            </div>
            
            {/* Perfil de Usuario */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800">{userEmail}</p>
                <p className="text-xs font-medium text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3. CONTENIDO DINÁMICO (Scroll) */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && renderDashboardMetrics()}
            {activeTab === 'labs' && <LaboratoriesSection isAuthenticated={isAuthenticated} />}
            {activeTab === 'reservations' && <ReservationsSection isAuthenticated={isAuthenticated} />}
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default App;