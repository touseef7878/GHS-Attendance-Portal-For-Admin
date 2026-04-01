import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Requests from './pages/Requests';
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';

// Wraps all admin routes — redirects to /login if not authenticated
function ProtectedLayout({ authed, login, logout }) {
  if (!authed) return <Navigate to="/login" replace />;
  return <DashboardLayout logout={logout} />;
}

function AppRoutes() {
  const { authed, login, logout } = useAuth();

  const router = createBrowserRouter([
    // Public — teacher self check-in (no auth required)
    { path: '/checkin', element: <CheckIn /> },

    // Public — login page
    {
      path: '/login',
      element: authed
        ? <Navigate to="/" replace />
        : <Login onLogin={login} />,
    },

    // Protected — principal admin panel
    {
      path: '/',
      element: <ProtectedLayout authed={authed} login={login} logout={logout} />,
      children: [
        { index: true,           element: <Dashboard /> },
        { path: 'teachers',      element: <Teachers /> },
        { path: 'attendance',    element: <Attendance /> },
        { path: 'reports',       element: <Reports /> },
        { path: 'requests',      element: <Requests /> },
      ],
    },

    // Catch-all
    { path: '*', element: <Navigate to="/" replace /> },
  ]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppRoutes />;
}
