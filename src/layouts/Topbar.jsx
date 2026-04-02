import { useState, useEffect } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { attendanceService } from '../services/attendanceService';

const titles = {
  '/':           { title: 'Overview',    sub: 'GHS Khanpur · Haripur, KPK' },
  '/teachers':   { title: 'Teachers',   sub: 'Manage your academic staff' },
  '/attendance': { title: 'Attendance', sub: 'Mark and track attendance' },
  '/reports':    { title: 'Reports',    sub: 'Audit logs and analytics' },
  '/requests':   { title: 'Requests',   sub: 'Pending correction requests' },
};

export default function Topbar({ logout, onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { title, sub } = titles[pathname] ?? { title: 'Dashboard', sub: '' };

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchPending() {
      try {
        const reqs = await attendanceService.fetchRequests();
        setPendingCount(reqs.filter(r => r.status === 'pending').length);
      } catch (_) {}
    }
    fetchPending();
    const id = setInterval(fetchPending, 60000);
    return () => clearInterval(id);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/teachers?q=${encodeURIComponent(query.trim())}`);
    setQuery(''); setSearchOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button className="btn-icon hamburger" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          <p className="topbar-sub">{sub}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Bell */}
        <button className="btn-icon" style={{ position: 'relative' }} onClick={() => navigate('/requests')} title="Pending requests">
          <Bell size={18} />
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute', top: '2px', right: '2px',
              minWidth: '16px', height: '16px',
              borderRadius: '9999px',
              backgroundColor: 'var(--absent)',
              border: '1.5px solid var(--surface)',
              fontSize: '0.6rem', fontWeight: '700', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}>
              {pendingCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--outline-variant)', opacity: 0.4, flexShrink: 0 }} />

        {/* Avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0040a1, #1a6fe8)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.78rem', fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 2px 8px rgba(0,64,161,0.3)', flexShrink: 0,
          }}>
            PR
          </div>
          <div className="avatar-label">
            <span style={{ fontWeight: '600', fontSize: '0.875rem', lineHeight: 1.2 }}>Principal</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--on-secondary-container)' }}>Admin</span>
          </div>
          <button className="btn-icon" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
