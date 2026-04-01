import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ logout }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar logout={logout} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
