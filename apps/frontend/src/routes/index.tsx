import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';
import { Laboratories } from '../pages/Laboratories';
import { MyReservations } from '../pages/MyReservations';
import { GlobalReservations } from '../pages/GlobalReservations';
import { Incidents } from '../pages/Incidents';
import {
  LoginView,
  RegisterView,
  ReservationsPlaceholder,
  CalendarPlaceholder,
  NotificationsPlaceholder,
  ReportsPlaceholder,
  UsersPlaceholder,
  SettingsPlaceholder,
} from './PlaceholderViews';

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/laboratorios" replace />;
};

export const router = createBrowserRouter([
  // RUTAS PÚBLICAS (Usa AuthLayout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginView />,
      },
      {
        path: 'register',
        element: <RegisterView />,
      },
    ],
  },

  // RUTAS PRIVADAS (Usa DashboardLayout y protegidas por ProtectedRoute)
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <RootRedirect />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'laboratorios',
        element: <Laboratories />,
      },
      {
        path: 'reservas',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCENTE', 'LAB_MANAGER']}>
            <GlobalReservations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'calendario',
        element: <CalendarPlaceholder />,
      },
      {
        path: 'mis-reservas',
        element: (
          <ProtectedRoute allowedRoles={['ESTUDIANTE', 'DOCENTE', 'LAB_MANAGER']}>
            <MyReservations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notificaciones',
        element: <NotificationsPlaceholder />,
      },
      {
        path: 'reportes',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'LAB_MANAGER']}>
            <ReportsPlaceholder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'incidentes',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'LAB_MANAGER']}>
            <Incidents />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPlaceholder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SettingsPlaceholder />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Comodín para redirigir a rutas válidas
  {
    path: '*',
    element: <RootRedirect />,
  },
]);
export default router;
