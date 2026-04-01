import { Bell, Search, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/':           { title: 'Overview',         sub: 'GHS Khanpur · Haripur, KPK' },
  '/teachers':   { title: 'Teacher Registry', sub: 'Manage your academic staff' },
  '/attendance': { title: 'Daily Attendance', sub: 'Mark and track attendance' },
  '/reports':    { title: 'Reports',          sub: 'Audit logs and analytics' },
  '/requests':   { title: 'Requests',         sub: 'Pending correction requests' },
};

export default function Topbar({ logout }) {
  const { pathname } = useLocation();
  const { title, sub } = titles[pathname] ?? { title: 'Dashboard', sub: '' };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2.5rem',
      backgroundColor: 'var(--surface)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ color: 'var(--on-secondary-container)', fontSize: '0.875rem', marginTop: '0.1rem' }}>{sub}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Search pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          backgroundColor: 'var(--surface-container-low)',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          cursor: 'text',
        }}>
          <Search size={15} color="var(--on-secondary-container)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--on-secondary-container)' }}>Search…</span>
        </div>

        {/* Bell */}
        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '7px', height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--absent)',
            border: '1.5px solid var(--surface)',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--outline-variant)', opacity: 0.4 }} />

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0040a1, #1a6fe8)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.8rem',
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 2px 8px rgba(0,64,161,0.3)',
          }}>
            PR
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem', lineHeight: 1.2 }}>Principal</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--on-secondary-container)' }}>Administrator</div>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            title="Sign out"
            style={{ marginLeft: '0.25rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
