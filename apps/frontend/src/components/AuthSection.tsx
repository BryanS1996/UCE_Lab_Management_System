import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Building2 } from 'lucide-react';
import { endpoints, setTokens, getToken } from '../api';

interface AuthSectionProps {
  isAuthenticated: boolean;
  user: { email: string; role: string; firstName?: string; lastName?: string } | null;
  onLogin: (userData: { email: string; role: string; firstName?: string; lastName?: string }) => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({ isAuthenticated, user, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('student@uce.edu.ec');
  const [loginPassword, setLoginPassword] = useState('Test1234!');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await endpoints.authLogin(loginEmail, loginPassword) as {
        accessToken: string;
        refreshToken: string;
        user: { email: string; role: string; firstName?: string; lastName?: string };
      };
      setTokens(data.accessToken, data.refreshToken);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await endpoints.authRegister({
        email: regEmail,
        firstName: regFirstName,
        lastName: regLastName,
        password: regPassword,
      }) as {
        accessToken: string;
        refreshToken: string;
        user: { email: string; role: string; firstName?: string; lastName?: string };
      };
      setTokens(data.accessToken, data.refreshToken);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-uce-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-uce-navy">Bienvenido</h2>
            <p className="text-sm text-gray-500 mt-1">Sesión iniciada correctamente</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Rol</p>
              <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
            </div>
            {user.firstName && user.lastName && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Nombre</p>
                <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-700">Sesión activa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-uce-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-uce-navy">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Ingresa tus credenciales para acceder' : 'Regístrate para comenzar'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Contraseña
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-uce-blue hover:bg-sky-600 text-white shadow-md hover:shadow-lg rounded-xl px-5 py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Nombre
                </label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Apellido
                </label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Contraseña
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-uce-blue focus:border-transparent rounded-xl px-4 py-3 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-uce-blue hover:bg-sky-600 text-white shadow-md hover:shadow-lg rounded-xl px-5 py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-uce-blue hover:text-sky-600 font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
