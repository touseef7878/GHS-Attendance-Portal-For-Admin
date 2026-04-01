import { useState, useEffect } from 'react';
import { Download, FileText, Activity } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    attendanceService.fetchAttendanceHistory().then(d => {
      setHistory(d);
      setLoading(false);
    });
  }, []);

  const filtered = history.filter(r =>
    r.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    let csv = 'Teacher Name,Date,Status\n';
    history.forEach(r => { csv += `${r.teacherName},${r.date},${r.status}\n`; });
    const a = document.createElement('a');
    a.href = encodeURI('data:text/csv;charset=utf-8,' + csv);
    a.download = 'attendance_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: FileText },
    { id: 'audit',      label: 'Audit Log',  icon: Activity },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.25rem' }}>
            {history.length} records
          </p>
          <h2 style={{ fontSize: '2rem' }}>Reports & Logs</h2>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', backgroundColor: 'var(--surface-container-low)', borderRadius: '9999px', padding: '0.25rem', gap: '0.25rem' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.5rem', borderRadius: '9999px',
              backgroundColor: activeTab === id ? 'var(--surface-container-lowest)' : 'transparent',
              color: activeTab === id ? 'var(--primary)' : 'var(--on-secondary-container)',
              fontWeight: activeTab === id ? '700' : '500',
              fontSize: '0.875rem',
              boxShadow: activeTab === id ? '0 2px 8px rgba(25,28,30,0.06)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="ambient-shadow" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', overflow: 'hidden' }}>
        {activeTab === 'attendance' && (
          <>
            <div style={{ padding: '1.5rem 1.75rem', backgroundColor: 'var(--surface-container-low)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input type="text" className="input-field" style={{ maxWidth: '260px' }} placeholder="Search teacher name..." value={search} onChange={e => setSearch(e.target.value)} />
              <input type="date" className="input-field" style={{ maxWidth: '180px' }} />
            </div>
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading...</div>
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
                  {filtered.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.teacherName}</td>
                      <td style={{ color: 'var(--on-secondary-container)', fontSize: '0.875rem' }}>{r.date}</td>
                      <td>
                        <span className={`pill ${r.status === 'Present' ? 'pill-success' : r.status === 'Absent' ? 'pill-danger' : 'pill-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td><span className="pill pill-primary">Manual</span></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-secondary-container)' }}>No records found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
        {activeTab === 'audit' && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>
            <Activity size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600' }}>Audit logs coming soon</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>System event tracking will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
