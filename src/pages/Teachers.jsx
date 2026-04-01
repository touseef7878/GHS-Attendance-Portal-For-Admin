import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Search } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({ name: '', subject: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadTeachers(); }, []);

  async function loadTeachers() {
    setLoading(true);
    const data = await attendanceService.fetchTeachers();
    setTeachers(data);
    setLoading(false);
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.subject.toLowerCase().includes(query.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (isEditing) await attendanceService.updateTeacher(currentTeacher.id, currentTeacher);
    else await attendanceService.addTeacher(currentTeacher);
    setIsModalOpen(false);
    loadTeachers();
  };

  const handleDelete = async (id) => {
    if (confirm('Remove this teacher?')) {
      await attendanceService.deleteTeacher(id);
      loadTeachers();
    }
  };

  const openForm = (teacher = null) => {
    setCurrentTeacher(teacher ?? { name: '', subject: '', phone: '' });
    setIsEditing(!!teacher);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.25rem' }}>
            {teachers.length} members
          </p>
          <h2 style={{ fontSize: '2rem' }}>Teaching Staff</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '0.875rem', padding: '0.625rem 1rem', boxShadow: '0 2px 8px rgba(25,28,30,0.05)' }}>
            <Search size={15} color="var(--on-secondary-container)" />
            <input
              className="input-field"
              style={{ background: 'none', padding: 0, width: '180px', fontSize: '0.875rem' }}
              placeholder="Search name or subject…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="ambient-shadow" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading…</div>
        ) : (
          <table>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))',
                        color: 'var(--on-primary-fixed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.75rem', fontFamily: 'Manrope, sans-serif',
                        flexShrink: 0,
                      }}>
                        {t.avatar}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="pill pill-primary">{t.subject}</span>
                  </td>
                  <td style={{ color: 'var(--on-secondary-container)', fontSize: '0.875rem' }}>{t.phone}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button className="btn-icon" onClick={() => openForm(t)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--absent)' }} onClick={() => handleDelete(t.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-secondary-container)' }}>No teachers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content ambient-shadow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.375rem' }}>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Alina Khan' },
                { label: 'Subject', key: 'subject', type: 'text', placeholder: 'e.g. Mathematics' },
                { label: 'Phone Number', key: 'phone', type: 'text', placeholder: '+92 300 0000000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>{label}</label>
                  <input
                    type={type}
                    className="input-field"
                    placeholder={placeholder}
                    value={currentTeacher[key]}
                    onChange={e => setCurrentTeacher({ ...currentTeacher, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
