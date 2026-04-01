import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, FileBarChart, CheckSquare, X } from 'lucide-react';

const routes = [
  { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
  { name: 'Teachers',   path: '/teachers',   icon: Users },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Reports',    path: '/reports',    icon: FileBarChart },
  { name: 'Requests',   path: '/requests',   icon: CheckSquare },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Brand */}
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/Logo.jpg"
            alt="GHS Khanpur"
            style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '0.88rem', color: 'var(--on-surface)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>GHS Khanpur</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '0.62rem', color: 'var(--on-secondary-container)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Staff Portal</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button className="btn-icon hamburger" onClick={onClose} style={{ display: 'flex' }}>
          <X size={18} />
        </button>
      </div>

      {/* Nav label */}
      <div style={{ padding: '0 1.75rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', opacity: 0.6 }}>
          Navigation
        </span>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0 0.75rem' }}>
        {routes.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.875rem',
              color: isActive ? 'var(--primary)' : 'var(--on-secondary-container)',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.9rem',
              backgroundColor: isActive ? 'var(--surface-container-lowest)' : 'transparent',
              boxShadow: isActive ? '0 2px 8px rgba(25,28,30,0.06)' : 'none',
              position: 'relative',
              transition: 'all 0.15s ease',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%',
                    height: '60%', width: '3px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer card */}
      <div style={{ padding: '1.5rem 1.5rem 0', marginTop: 'auto' }}>
        <div style={{ backgroundColor: 'var(--primary-fixed)', borderRadius: '1.25rem', padding: '1.125rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--on-primary-fixed)', marginBottom: '0.2rem', fontFamily: 'Manrope, sans-serif' }}>
            Govt High School Khanpur
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary)', lineHeight: 1.4 }}>
            Haripur, KPK · 2025–26
          </p>
        </div>
      </div>
    </aside>
  );
}
