import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';
import { Laboratories } from '../pages/Laboratories';
import { MyReservations } from '../pages/MyReservations';
import { GlobalReservations } from '../pages/GlobalReservations';
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
