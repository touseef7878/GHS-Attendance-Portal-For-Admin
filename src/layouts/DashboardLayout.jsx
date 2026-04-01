import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, FileBarChart, CheckSquare } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const routes = [
  { name: 'Home',       path: '/',           icon: LayoutDashboard },
  { name: 'Teachers',   path: '/teachers',   icon: Users },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Reports',    path: '/reports',    icon: FileBarChart },
  { name: 'Requests',   path: '/requests',   icon: CheckSquare },
];

export default function DashboardLayout({ logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile drawer */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="main-area">
        <Topbar logout={logout} onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {routes.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={20} strokeWidth={1.8} />
              {name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
