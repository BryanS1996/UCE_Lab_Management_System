import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Spinner de carga premium
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 border-4 border-indigo-100 border-b-indigo-500 rounded-full animate-spin duration-750 reverse"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Cargando UCE Lab...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir a login guardando la ubicación previa
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Vista premium de "No Autorizado" integrada
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-red-50 flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-full mb-5 animate-bounce">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
          <p className="text-sm text-slate-500 mb-6">
            Lo sentimos, tu rol actual ({user.role}) no tiene los privilegios necesarios para acceder a este módulo.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-250 cursor-pointer shadow-md"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
