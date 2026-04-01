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

function AppRoutes() {
  const { authed, loading, login, logout } = useAuth();

  // Wait for Supabase to resolve the session before rendering anything
  // Prevents flash of login page on refresh when already authenticated
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface)',
      }}>
        <img
          src="/Logo.jpg"
          alt="Loading"
          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', opacity: 0.6, animation: 'pulse 1.5s ease-in-out infinite' }}
        />
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  const router = createBrowserRouter([
    // Public — teacher self check-in, no auth required
    { path: '/checkin', element: <CheckIn /> },

    // Public — login
    {
      path: '/login',
      element: authed ? <Navigate to="/" replace /> : <Login onLogin={login} />,
    },

    // Protected — principal admin panel
    {
      path: '/',
      element: authed ? <DashboardLayout logout={logout} /> : <Navigate to="/login" replace />,
      children: [
        { index: true,        element: <Dashboard /> },
        { path: 'teachers',   element: <Teachers /> },
        { path: 'attendance', element: <Attendance /> },
        { path: 'reports',    element: <Reports /> },
        { path: 'requests',   element: <Requests /> },
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
