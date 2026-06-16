import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';
import { Laboratories } from '../pages/Laboratories';
import { MyReservations } from '../pages/MyReservations';
import {
  LoginView,
  ReservationsPlaceholder,
  CalendarPlaceholder,
  NotificationsPlaceholder,
  ReportsPlaceholder,
  UsersPlaceholder,
  SettingsPlaceholder,
} from './PlaceholderViews';

export const router = createBrowserRouter([
  // RUTAS PÚBLICAS (Usa AuthLayout)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginView />,
      },
      {
        path: 'register',
        element: <div className="text-center py-4">Página de Registro (MVP Base)</div>,
      },
    ],
  },

  // RUTAS PRIVADAS (Usa DashboardLayout y protegidas por ProtectedRoute)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'laboratorios',
        element: <Laboratories />,
      },
      {
        path: 'reservas',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCENTE', 'LAB_MANAGER']}>
            <ReservationsPlaceholder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'calendario',
        element: <CalendarPlaceholder />,
      },
      {
        path: 'mis-reservas',
        element: <MyReservations />,
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
        path: 'usuarios',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPlaceholder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracion',
        element: <SettingsPlaceholder />,
      },
    ],
  },

  // Comodín para redirigir a rutas válidas
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
export default router;
