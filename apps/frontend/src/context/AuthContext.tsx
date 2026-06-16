import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getToken, setTokens, clearTokens } from '../api/axiosInstance';
import { authApi } from '../api/auth';
import { decodeJwtPayload, mapRole } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, userPayload: any) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (accessToken: string, refreshToken: string, userPayload: any) => {
    setTokens(accessToken, refreshToken);
    
    // Decodificamos el token para obtener el rol del backend
    const decoded = decodeJwtPayload(accessToken);
    const mappedRole = decoded ? mapRole(decoded.role) : 'ESTUDIANTE';

    setUser({
      id: userPayload.id || decoded?.sub || '',
      email: userPayload.email || decoded?.email || '',
      firstName: userPayload.firstName || '',
      lastName: userPayload.lastName || '',
      role: mappedRole,
    });
    setIsAuthenticated(true);
  };

  const checkSession = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Intentamos obtener el perfil completo desde el backend
      const meData = await authApi.getMe();
      
      const decoded = decodeJwtPayload(token);
      // El backend meData puede contener un campo roles[] o role directo
      const backendRole = meData.roles?.[0]?.name || decoded?.role || 'student';
      const mappedRole = mapRole(backendRole);

      setUser({
        id: meData.id || decoded?.sub || '',
        email: meData.email || decoded?.email || '',
        firstName: meData.firstName || '',
        lastName: meData.lastName || '',
        role: mappedRole,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      // Si falla obtener perfil, limpiamos la sesión
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Escuchar el evento global de logout que dispara Axios
    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth_logout', handleGlobalLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
