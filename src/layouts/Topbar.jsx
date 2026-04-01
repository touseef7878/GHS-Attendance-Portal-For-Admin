import { useState, useEffect } from 'react';
import { Bell, Search, LogOut, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { attendanceService } from '../services/attendanceService';

const titles = {
  '/':           { title: 'Overview',         sub: 'GHS Khanpur · Haripur, KPK' },
  '/teachers':   { title: 'Teacher Registry', sub: 'Manage your academic staff' },
  '/attendance': { title: 'Daily Attendance', sub: 'Mark and track attendance' },
  '/reports':    { title: 'Reports',          sub: 'Audit logs and analytics' },
  '/requests':   { title: 'Requests',         sub: 'Pending correction requests' },
};

export default function Topbar({ logout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { title, sub } = titles[pathname] ?? { title: 'Dashboard', sub: '' };

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Poll pending requests count every 60s
  useEffect(() => {
    async function fetchPending() {
      try {
        const reqs = await attendanceService.fetchRequests();
        setPendingCount(reqs.filter(r => r.status === 'pending').length);
      } catch (_) {}
    }
    fetchPending();
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/teachers?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setSearchOpen(false);
  };

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
        {/* Search */}
        {searchOpen ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '9999px', padding: '0.4rem 0.75rem 0.4rem 1.25rem', boxShadow: '0 2px 8px rgba(25,28,30,0.08)' }}>
            <Search size={14} color="var(--on-secondary-container)" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search teachers…"
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', width: '160px', fontFamily: 'inherit', color: 'var(--on-surface)' }}
            />
            <button type="button" onClick={() => { setSearchOpen(false); setQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--on-secondary-container)' }}>
              <X size={14} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '9999px', padding: '0.5rem 1.25rem', cursor: 'pointer', border: 'none' }}
          >
            <Search size={15} color="var(--on-secondary-container)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--on-secondary-container)' }}>Search…</span>
          </button>
        )}

        {/* Bell with live pending count */}
        <button className="btn-icon" style={{ position: 'relative' }} onClick={() => navigate('/requests')} title="View pending requests">
          <Bell size={18} />
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute', top: '2px', right: '2px',
              minWidth: '16px', height: '16px',
              borderRadius: '9999px',
              backgroundColor: 'var(--absent)',
              border: '1.5px solid var(--surface)',
              fontSize: '0.6rem', fontWeight: '700',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}>
              {pendingCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--outline-variant)', opacity: 0.4 }} />

        {/* Avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          <button className="btn-icon" onClick={logout} title="Sign out" style={{ marginLeft: '0.25rem' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
