import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

const TODAY = new Date().toISOString().split('T')[0];
const NOW = new Date();
const DAY_NAME = NOW.toLocaleDateString('en-PK', { weekday: 'long' });
const DATE_STR = NOW.toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' });

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [teachers, attendance, trendData] = await Promise.all([
          attendanceService.fetchTeachers(),
          attendanceService.fetchAttendance(TODAY),
          attendanceService.fetchWeeklyTrend(),
        ]);
        let present = 0, absent = 0, late = 0;
        Object.values(attendance).forEach(v => {
          if (v === 'Present') present++;
          else if (v === 'Absent') absent++;
          else if (v === 'Late') late++;
        });
        setStats({ total: teachers.length, present, absent, late });
        setRecentTeachers(teachers.slice(0, 5).map(t => ({
          ...t,
          status: attendance[t.id] || null,
        })));
        setTrend(trendData);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rate = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
  const maxTrend = trend.length ? Math.max(...trend.map(t => t.pct), 1) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {error && (
        <div style={{ backgroundColor: 'var(--absent-bg)', borderRadius: '1rem', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--absent)' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Failed to load data: {error}</span>
        </div>
      )}

      {/* Top row */}
      <div className="dash-top">

        {/* Hero card */}
        <div className="hero-card ambient-shadow">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.5rem' }}>
              Attendance Rate · Today
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '4.5rem', fontFamily: 'Manrope, sans-serif', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.04em' }} className="hero-rate">
                {loading ? '—' : `${rate}%`}
              </span>
              {!loading && trend.length >= 2 && (() => {
                const prev = trend[trend.length - 2]?.pct ?? rate;
                const diff = rate - prev;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '9999px', padding: '0.25rem 0.625rem' }}>
                    <ArrowUpRight size={13} style={{ transform: diff < 0 ? 'rotate(90deg)' : 'none' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{diff >= 0 ? '+' : ''}{diff}%</span>
                  </div>
                );
              })()}
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>
              {loading ? '…' : `${stats.present} of ${stats.total} teachers present · ${DAY_NAME}, ${DATE_STR}`}
            </p>
          </div>
          {/* Real weekly trend bar chart */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: '2rem', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '52px' }}>
            {(trend.length > 0 ? trend : Array(6).fill({ label: '…', pct: 0 })).map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%',
                  height: `${Math.max(4, (v.pct / maxTrend) * 40)}px`,
                  backgroundColor: i === trend.length - 1 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                }} />
                <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-col">
          <StatCard label="Total Staff" value={stats.total} icon={<Users size={20} />} loading={loading} />
          <StatCard label="Present" value={stats.present} icon={<UserCheck size={20} />} loading={loading} accent="var(--present)" accentBg="var(--present-bg)" />
        </div>

        <div className="stat-col">
          <StatCard label="Absent" value={stats.absent} icon={<UserX size={20} />} loading={loading} accent="var(--absent)" accentBg="var(--absent-bg)" />
          <StatCard label="Late" value={stats.late} icon={<TrendingUp size={20} />} loading={loading} accent="var(--late)" accentBg="var(--late-bg)" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="dash-bottom">

        {/* Recent teachers */}
        <div className="ambient-shadow" style={{
          flex: 1.5, minWidth: '300px',
          backgroundColor: 'var(--surface-container-lowest)',
          borderRadius: '2rem',
          padding: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Today's Staff Status</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {loading
              ? <p style={{ color: 'var(--on-secondary-container)', fontSize: '0.875rem' }}>Loading…</p>
              : recentTeachers.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: '1rem',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <Avatar initials={t.avatar} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>{t.subject}</div>
                    </div>
                  </div>
                  <StatusPill status={t.status} />                </div>
              ))
            }
          </div>
        </div>

        {/* Quick info panel */}
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ambient-shadow" style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: '2rem',
            padding: '2rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>School Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Address', value: 'RW37+HH9, Khanpur, 22620' },
                { label: 'Phone',   value: '(0995) 640230' },
                { label: 'Hours',   value: '8:15 am – 2:00 pm' },
                { label: 'District', value: 'Haripur, KPK' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="ambient-shadow" style={{ borderRadius: '2rem', overflow: 'hidden', height: '220px', position: 'relative' }}>
            <iframe
              title="GHS Khanpur Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.9180%2C33.8280%2C72.9380%2C33.8420&layer=mapnik&marker=33.8350%2C72.9280"
              style={{ width: '100%', height: '100%', border: 'none' }}
              loading="lazy"
            />
            <a
              href="https://www.openstreetmap.org/?mlat=33.8350&mlon=72.9280#map=15/33.8350/72.9280"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                backgroundColor: 'var(--surface-container-lowest)',
                borderRadius: '0.625rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: '600',
                color: 'var(--primary)',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(25,28,30,0.1)',
              }}
            >
              Open Map ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, loading, accent, accentBg }) {
  return (
    <div className="ambient-shadow" style={{
      backgroundColor: 'var(--surface-container-lowest)',
      borderRadius: '1.5rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '1rem',
        backgroundColor: accentBg || 'var(--surface-container-high)',
        color: accent || 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)', fontWeight: '600', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontFamily: 'Manrope, sans-serif', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.03em', color: accent || 'var(--on-surface)' }}>
          {loading ? '—' : value}
        </p>
      </div>
    </div>
  );
}

function Avatar({ initials }) {
  return (
    <div style={{
      width: '38px', height: '38px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))',
      color: 'var(--on-primary-fixed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '700', fontSize: '0.75rem',
      fontFamily: 'Manrope, sans-serif',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return <span style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>Not marked</span>;
  const map = { Present: 'pill-success', Absent: 'pill-danger', Late: 'pill-warning' };
  return <span className={`pill ${map[status] || 'pill-primary'}`}>{status}</span>;
}
