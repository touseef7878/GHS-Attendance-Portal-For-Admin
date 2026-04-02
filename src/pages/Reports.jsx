import { useState, useEffect } from 'react';
import { Download, FileText, Activity } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

export default function Reports() {
  const [activeTab, setActiveTab]   = useState('attendance');
  const [history, setHistory]       = useState([]);   // all attendance records from DB
  const [teachers, setTeachers]     = useState([]);   // full teacher list
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    Promise.all([
      attendanceService.fetchAttendanceHistory(),
      attendanceService.fetchTeachers(),
    ]).then(([hist, tList]) => {
      setHistory(hist);
      setTeachers(tList);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // When a date is selected, build a full row for EVERY teacher:
  // - if they have a record → show their status
  // - if not → show "Not Marked"
  // When no date filter, just show the raw history rows
  const rows = (() => {
    if (dateFilter) {
      // Map existing records for this date
      const recordsOnDate = {};
      history
        .filter(r => r.date === dateFilter)
        .forEach(r => { recordsOnDate[r.teacherId] = r; });

      // Build one row per teacher
      return teachers
        .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
        .map(t => recordsOnDate[t.id]
          ? recordsOnDate[t.id]
          : { teacherId: t.id, teacherName: t.name, date: dateFilter, status: null }
        );
    }

    // No date filter — show all history rows, filtered by name search
    return history.filter(r =>
      r.teacherName.toLowerCase().includes(search.toLowerCase())
    );
  })();

  // Export downloads exactly what's visible in the table
  const handleExport = () => {
    if (rows.length === 0) return;

    const filename = dateFilter
      ? `attendance_${dateFilter}.csv`
      : `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;

    let csv = 'Teacher Name,Date,Status\n';
    rows.forEach(r => {
      // Escape commas in names
      const name = `"${r.teacherName}"`;
      csv += `${name},${r.date},${r.status ?? 'Not Marked'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: FileText },
    { id: 'audit',      label: 'Audit Log',  icon: Activity },
  ];

  // Summary counts for the selected date
  const summary = dateFilter ? {
    present:    rows.filter(r => r.status === 'Present').length,
    absent:     rows.filter(r => r.status === 'Absent').length,
    late:       rows.filter(r => r.status === 'Late').length,
    notMarked:  rows.filter(r => !r.status).length,
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.25rem' }}>
            {dateFilter ? `${rows.length} teachers` : `${history.length} records`}
          </p>
          <h2 style={{ fontSize: '2rem' }}>Reports & Logs</h2>
        </div>
        <button className="btn-secondary" onClick={handleExport} disabled={rows.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', backgroundColor: 'var(--surface-container-low)', borderRadius: '9999px', padding: '0.25rem', gap: '0.25rem' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.5rem', borderRadius: '9999px',
            backgroundColor: activeTab === id ? 'var(--surface-container-lowest)' : 'transparent',
            color: activeTab === id ? 'var(--primary)' : 'var(--on-secondary-container)',
            fontWeight: activeTab === id ? '700' : '500', fontSize: '0.875rem',
            boxShadow: activeTab === id ? '0 2px 8px rgba(25,28,30,0.06)' : 'none',
            transition: 'all 0.15s',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="ambient-shadow table-scroll" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', overflow: 'hidden' }}>
        {activeTab === 'attendance' && (
          <>
            {/* Filters */}
            <div style={{ padding: '1.5rem 1.75rem', backgroundColor: 'var(--surface-container-low)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                className="input-field"
                style={{ maxWidth: '260px' }}
                placeholder="Search teacher name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <input
                type="date"
                className="input-field"
                style={{ maxWidth: '180px' }}
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
              {(search || dateFilter) && (
                <button className="btn-secondary" style={{ padding: '0.625rem 1rem', fontSize: '0.82rem' }} onClick={() => { setSearch(''); setDateFilter(''); }}>
                  Clear
                </button>
              )}
            </div>

            {/* Date summary bar */}
            {summary && (
              <div style={{ padding: '1rem 1.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--surface-container-high)' }}>
                <span className="pill pill-success">{summary.present} Present</span>
                <span className="pill pill-danger">{summary.absent} Absent</span>
                <span className="pill pill-warning">{summary.late} Late</span>
                {summary.notMarked > 0 && (
                  <span className="pill" style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-secondary-container)' }}>
                    {summary.notMarked} Not Marked
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading…</div>
            ) : (
              <table>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                    <th>Teacher</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Entry Type</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.teacherName}</td>
                      <td style={{ color: 'var(--on-secondary-container)', fontSize: '0.875rem' }}>{r.date}</td>
                      <td>
                        {r.status
                          ? <span className={`pill ${r.status === 'Present' ? 'pill-success' : r.status === 'Absent' ? 'pill-danger' : 'pill-warning'}`}>{r.status}</span>
                          : <span className="pill" style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-secondary-container)' }}>Not Marked</span>
                        }
                      </td>
                      <td>
                        <span className="pill pill-primary">{r.status ? 'Manual' : '—'}</span>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-secondary-container)' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>
            <Activity size={40} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600' }}>Audit logs coming soon</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>System event tracking will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
