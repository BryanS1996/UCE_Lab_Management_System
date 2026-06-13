import React, { useState } from 'react';
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-uce-navy mb-4">Usuario Autenticado</h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Rol:</span> <span className="capitalize">{user.role}</span>
          </p>
          {user.firstName && user.lastName && (
            <p className="text-gray-700">
              <span className="font-semibold">Nombre:</span> {user.firstName} {user.lastName}
            </p>
          )}
        </div>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">✓ Sesión activa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-uce-navy">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-uce-blue hover:text-uce-purple underline"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLogin ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-uce-blue text-white rounded-md hover:bg-uce-purple transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uce-blue"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-uce-purple text-white rounded-md hover:bg-uce-blue transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthSection;
