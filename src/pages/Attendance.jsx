import { useState, useEffect } from 'react';
import { Save, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => { loadData(); }, [date]);

  async function loadData() {
    setLoading(true);
    const [tList, attData] = await Promise.all([
      attendanceService.fetchTeachers(),
      attendanceService.fetchAttendance(date),
    ]);
    setTeachers(tList);
    const init = { ...attData };
    if (Object.keys(init).length === 0) tList.forEach(t => (init[t.id] = 'Present'));
    setAttendance(init);
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    await attendanceService.saveAttendance(date, attendance);
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const counts = Object.values(attendance).reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving\u2026' : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
      </div>

      <div className="ambient-shadow" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading\u2026</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {teachers.map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.125rem 1.75rem',
                backgroundColor: i % 2 === 0 ? 'var(--surface-container-lowest)' : 'var(--surface-container-low)',
                gap: '1rem', flexWrap: 'wrap',
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
                      onClick={() => setAttendance(prev => ({ ...prev, [t.id]: opt }))}
                      className={attendance[t.id] === opt ? `active-${opt.toLowerCase()}` : ''}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>Records updated successfully</div>
          </div>
        </div>
      )}
    </div>
  );
}
