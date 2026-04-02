import { useState, useEffect } from 'react';
import { Save, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Search } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function Attendance() {
  const [date, setDate]           = useState(() => new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers]   = useState([]);
  const [attendance, setAttendance] = useState({});  // { [id]: 'Present'|'Absent'|'Late'|undefined }
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(false);
  const [error, setError]         = useState(null);
  const [isNewDay, setIsNewDay]   = useState(false);
  const [search, setSearch]       = useState(''); // true when no records exist yet for this date

  useEffect(() => { loadData(); }, [date]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [tList, attData] = await Promise.all([
        attendanceService.fetchTeachers(),
        attendanceService.fetchAttendance(date),
      ]);
      setTeachers(tList);
      // Never auto-fill — keep only what's actually saved in DB
      setAttendance(attData);
      setIsNewDay(Object.keys(attData).length === 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const mark = (teacherId, status) => {
    setAttendance(prev => ({ ...prev, [teacherId]: status }));
    if (isNewDay) setIsNewDay(false);
  };

  // Mark all as a given status in one click
  const markAll = (status) => {
    const all = {};
    teachers.forEach(t => { all[t.id] = status; });
    setAttendance(all);
    setIsNewDay(false);
  };

  const handleSave = async () => {
    // Only save teachers that have been explicitly marked
    const marked = Object.entries(attendance).filter(([, v]) => v);
    if (marked.length === 0) {
      setError('Please mark at least one teacher before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await attendanceService.saveAttendance(date, attendance);
      setToast(true);
      setIsNewDay(false);
      setTimeout(() => setToast(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const markedCount   = Object.values(attendance).filter(Boolean).length;
  const unmarkedCount = teachers.length - markedCount;
  const counts = Object.values(attendance).reduce((acc, v) => {
    if (v) acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.25rem' }}>
            Attendance Register
          </p>
          <h2 style={{ fontSize: '1.75rem' }}>{fmtDate(date)}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '0.25rem', boxShadow: '0 2px 8px rgba(25,28,30,0.05)' }}>
            <button className="btn-icon" onClick={() => setDate(d => offsetDate(d, -1))}><ChevronLeft size={18} /></button>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '0.875rem', fontFamily: 'inherit', color: 'var(--on-surface)', cursor: 'pointer', outline: 'none', padding: '0.25rem 0.5rem' }}
            />
            <button className="btn-icon" onClick={() => setDate(d => offsetDate(d, 1))}><ChevronRight size={18} /></button>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading || markedCount === 0}>
            {saving ? 'Saving…' : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>

      {/* New day banner */}
      {isNewDay && !loading && (
        <div style={{
          backgroundColor: 'var(--primary-fixed)',
          borderRadius: '1.5rem',
          padding: '1.25rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <AlertCircle size={20} color="var(--primary)" />
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--on-primary-fixed)' }}>No attendance recorded yet for this date</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.1rem' }}>Mark each teacher individually, or use quick-fill below.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => markAll('Present')} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: 'var(--present-bg)', color: 'var(--present)', fontWeight: '700', fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
              All Present
            </button>
            <button onClick={() => markAll('Absent')} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: 'var(--absent-bg)', color: 'var(--absent)', fontWeight: '700', fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
              All Absent
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: 'var(--absent-bg)', borderRadius: '1rem', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--absent)' }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Present', count: counts['Present'] || 0, cls: 'pill-success' },
          { label: 'Absent',  count: counts['Absent']  || 0, cls: 'pill-danger' },
          { label: 'Late',    count: counts['Late']    || 0, cls: 'pill-warning' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`pill ${cls}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '1rem' }}>{count}</span>
            {label}
          </div>
        ))}
        {unmarkedCount > 0 && (
          <div className="pill" style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-secondary-container)', fontSize: '0.875rem', padding: '0.5rem 1.25rem', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '1rem' }}>{unmarkedCount}</span>
            Not marked
          </div>
        )}
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '0.625rem 1.25rem', boxShadow: '0 2px 8px rgba(25,28,30,0.05)', maxWidth: '360px' }}>
        <Search size={15} color="var(--on-secondary-container)" style={{ flexShrink: 0 }} />
        <input
          className="input-field"
          style={{ background: 'none', padding: 0, fontSize: '0.875rem' }}
          placeholder="Search teacher name or subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-secondary-container)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            ✕
          </button>
        )}
      </div>

      {/* Teacher list */}
      <div className="ambient-shadow" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>
                No teachers match "{search}"
              </div>
            )}
            {filtered.map((t, i) => {
              const status = attendance[t.id];
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.125rem 1.75rem',
                  backgroundColor: i % 2 === 0 ? 'var(--surface-container-lowest)' : 'var(--surface-container-low)',
                  gap: '1rem', flexWrap: 'wrap',
                  // Highlight unmarked rows subtly
                  outline: !status ? '1.5px dashed var(--outline-variant)' : 'none',
                  outlineOffset: '-1px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '180px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))',
                      color: 'var(--on-primary-fixed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '0.75rem', fontFamily: 'Manrope, sans-serif', flexShrink: 0,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>{t.subject}</div>
                    </div>
                  </div>
                  <div className="status-toggle">
                    {['Present', 'Absent', 'Late'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => mark(t.id, opt)}
                        className={status === opt ? `active-${opt.toLowerCase()}` : ''}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          backgroundColor: 'var(--surface-container-lowest)',
          borderRadius: '1.25rem', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 20px 40px rgba(25,28,30,0.12)',
          animation: 'slideUp 0.2s ease', zIndex: 300,
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--present-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} color="var(--present)" />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Attendance saved</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>{markedCount} teachers recorded for {date}</div>
          </div>
        </div>
      )}
    </div>
  );
}
