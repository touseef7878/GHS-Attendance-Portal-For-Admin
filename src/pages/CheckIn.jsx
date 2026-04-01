import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { CheckCircle, AlertCircle, LogIn } from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];
const DATE_LABEL = new Date().toLocaleDateString('en-PK', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

export default function CheckIn() {
  const [teachers, setTeachers]     = useState([]);
  const [teacherId, setTeacherId]   = useState('');
  const [note, setNote]             = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    attendanceService.fetchTeachers()
      .then(data => { setTeachers(data); setLoading(false); })
      .catch(() => { setError('Could not load teacher list.'); setLoading(false); });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teacherId) return;
    setSubmitting(true);
    setError(null);
    try {
      await attendanceService.submitRequest(teacherId, TODAY, note.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedTeacher = teachers.find(t => t.id === teacherId);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Card */}
      <div className="ambient-shadow" style={{
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: '2.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '460px',
      }}>
        {/* Logo + school name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
          <img
            src="/Logo.jpg"
            alt="GHS Khanpur"
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(0,64,161,0.2)' }}
          />
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            GHS Khanpur
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-secondary-container)', marginTop: '0.25rem' }}>
            Teacher Self Check-In
          </p>
        </div>

        {/* Date badge */}
        <div style={{
          backgroundColor: 'var(--primary-fixed)',
          borderRadius: '1rem',
          padding: '0.75rem 1.25rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.02em' }}>
            {DATE_LABEL}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: 'var(--present-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <CheckCircle size={32} color="var(--present)" />
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Request Sent!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--on-secondary-container)', lineHeight: 1.6 }}>
              Your attendance request has been submitted to the Principal.
              You will be marked <strong>Present</strong> once it is approved.
            </p>
            {selectedTeacher && (
              <div style={{
                marginTop: '1.5rem',
                backgroundColor: 'var(--surface-container-low)',
                borderRadius: '1.25rem',
                padding: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))',
                  color: 'var(--on-primary-fixed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.75rem', fontFamily: 'Manrope, sans-serif',
                }}>
                  {selectedTeacher.avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedTeacher.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>{selectedTeacher.subject}</div>
                </div>
              </div>
            )}
            <button
              className="btn-secondary"
              style={{ marginTop: '2rem', width: '100%', justifyContent: 'center' }}
              onClick={() => { setSuccess(false); setTeacherId(''); setNote(''); }}
            >
              Submit another
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Select your name
              </label>
              {loading ? (
                <div className="input-field" style={{ color: 'var(--on-secondary-container)' }}>Loading teachers…</div>
              ) : (
                <select
                  className="input-field"
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">— Choose your name —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.subject}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Note <span style={{ fontWeight: '400', color: 'var(--on-secondary-container)' }}>(optional)</span>
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="e.g. Arrived at 8:10 am, signed register"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: 'var(--absent-bg)', borderRadius: '0.875rem', padding: '0.875rem 1rem', color: 'var(--absent)' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !teacherId}
              style={{ justifyContent: 'center', padding: '1rem', fontSize: '0.95rem', borderRadius: '1.25rem', marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              {submitting ? 'Submitting…' : 'Submit Attendance Request'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--on-secondary-container)', textAlign: 'center' }}>
        Govt High School Khanpur · Haripur, KPK · (0995) 640230
      </p>
    </div>
  );
}
