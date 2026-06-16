import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, LogIn, Calendar, Activity, Building2, Clock } from 'lucide-react';

// --- VISTA DE LOGIN MOCKUP (Image 1 reference) ---
export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Llamada real de login al API Gateway
      const data = await authApi.login(email, password);
      
      // Guardar tokens y cargar sesión
      login(data.accessToken, data.refreshToken, data.user);
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      // Extraer el mensaje real devuelto por el backend
      const message = err.response?.data?.message || err.data?.message || 'Error de conexión con el servidor. Inténtalo más tarde.';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-center">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
      <p className="text-sm text-slate-400 mt-1 select-none">Inicia sesión para continuar</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
        <Input
          id="email"
          type="email"
          label="Correo electrónico"
          placeholder="usuario@uce.edu.ec"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-slate-700 transition-colors p-1 -mr-2 rounded-lg cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          required
        />

        {/* Recordarme y Olvido */}
        <div className="flex items-center justify-between text-xs select-none">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Recordarme</span>
          </label>
          <a href="#forgot" className="text-blue-600 hover:underline font-semibold">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Iniciar sesión */}
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          leftIcon={<LogIn className="w-4 h-4" />}
          className="w-full py-3"
        >
          Iniciar sesión
        </Button>
      </form>

      {/* o continúa con */}
      <div className="relative my-6 select-none">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-150"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">o continúa con</span>
        </div>
      </div>

      {/* SSO Button (Visual Match) */}
      <Button
        variant="sso"
        leftIcon={<ShieldCheckIcon />}
        onClick={() => setError('El inicio de sesión único (SSO) no está disponible en este ambiente.')}
      >
        SSO UCE (Single Sign-On)
      </Button>
    </div>
  );
};

// Mini-componente de escudo SSO
const ShieldCheckIcon = () => (
  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);


// --- VISTAS PLACEHOLDERS (Para no crear pantallas todavía, pero validar rutas) ---
const PagePlaceholder: React.FC<{ title: string; desc?: string }> = ({ title, desc }) => (
  <div className="space-y-6">
    <Card className="p-8 text-left">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-slate-500 text-sm mt-1">{desc || 'Esta pantalla se implementará en la siguiente fase.'}</p>
      <div className="mt-8 border border-dashed border-slate-200 rounded-2xl h-80 flex items-center justify-center text-slate-400 bg-slate-50/50">
        Sección de {title} (MVP Base Configurado)
      </div>
    </Card>
  </div>
);

export const DashboardPlaceholder: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 text-left">
      {/* Cards de Métricas (Image 2 mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">24</span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Total laboratorios</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">18</span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Reservas programadas</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">6</span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Laboratorios disponibles</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">3</span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Mis reservas activas</p>
          </div>
        </Card>
      </div>

      {/* Grid del contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8">
          <Card.Title>Laboratorios Disponibles</Card.Title>
          <div className="mt-6 border border-dashed border-slate-200 rounded-2xl h-64 flex items-center justify-center text-slate-400 bg-slate-50/50">
            Contenedor del carrusel de laboratorios
          </div>
        </Card>

        <Card className="p-8">
          <Card.Title>Calendario Semanal</Card.Title>
          <div className="mt-6 border border-dashed border-slate-200 rounded-2xl h-64 flex items-center justify-center text-slate-400 bg-slate-50/50">
            Calendario lateral
          </div>
        </Card>
      </div>
    </div>
  );
};

export const LaboratoriesPlaceholder: React.FC = () => (
  <PagePlaceholder title="Laboratorios" desc="Listado completo y filtros de búsqueda de laboratorios de la UCE." />
);

export const ReservationsPlaceholder: React.FC = () => (
  <PagePlaceholder title="Reservas Globales" desc="Administración de reservas para Administradores y Docentes." />
);

export const CalendarPlaceholder: React.FC = () => (
  <PagePlaceholder title="Calendario" desc="Calendario interactivo mensual de disponibilidad y reservas." />
);

export const MyReservationsPlaceholder: React.FC = () => (
  <PagePlaceholder title="Mis Reservas" desc="Seguimiento de las solicitudes de reserva del usuario actual." />
);

export const NotificationsPlaceholder: React.FC = () => (
  <PagePlaceholder title="Notificaciones" desc="Historial de alertas y notificaciones del sistema." />
);

export const ReportsPlaceholder: React.FC = () => (
  <PagePlaceholder title="Reportes e Estadísticas" desc="Métricas detalladas sobre el uso de laboratorios y ocupación." />
);

export const UsersPlaceholder: React.FC = () => (
  <PagePlaceholder title="Gestión de Usuarios" desc="Panel administrativo para roles, permisos y usuarios." />
);

export const SettingsPlaceholder: React.FC = () => (
  <PagePlaceholder title="Configuración" desc="Preferencias del sistema y ajustes de cuenta personal." />
);
