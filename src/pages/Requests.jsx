import { useState, useEffect } from 'react';
import { Check, X, Clock, RefreshCw, AlertCircle, Link2 } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [acting, setActing]     = useState(null); // id of request being acted on

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.fetchRequests();
      setRequests(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(req) {
    setActing(req.id);
    try {
      await attendanceService.approveRequest(req.id, req.teacherId, req.date);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    } catch (e) {
      alert('Failed to approve: ' + e.message);
    } finally {
      setActing(null);
    }
  }

  async function handleReject(req) {
    setActing(req.id);
    try {
      await attendanceService.rejectRequest(req.id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    } catch (e) {
      alert('Failed to reject: ' + e.message);
    } finally {
      setActing(null);
    }
  }

  const pending  = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.25rem' }}>
            {pending.length} pending
          </p>
          <h2 style={{ fontSize: '2rem' }}>Attendance Requests</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="/checkin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none', fontSize: '0.85rem' }}
            title="Share this link with teachers"
          >
            <Link2 size={15} /> Teacher Check-In Link
          </a>
          <button className="btn-icon" onClick={load} title="Refresh">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* How it works banner */}
      <div style={{
        backgroundColor: 'var(--primary-fixed)',
        borderRadius: '1.5rem',
        padding: '1.25rem 1.75rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
          <Clock size={16} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--on-primary-fixed)', marginBottom: '0.25rem' }}>How this works</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--primary)', lineHeight: 1.6 }}>
            Teachers submit a self-check-in request. You review it here — if the teacher is physically present in school, approve it and their attendance is automatically marked <strong>Present</strong>. Reject if they are not. You can also mark attendance directly on the Attendance page at any time.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: 'var(--absent-bg)', borderRadius: '1rem', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--absent)' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--on-secondary-container)' }}>Loading requests…</div>
      )}

      {/* Pending */}
      {!loading && pending.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SectionLabel label="Pending Review" count={pending.length} />
          {pending.map(req => (
            <RequestCard key={req.id} req={req} acting={acting} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}

      {/* Resolved */}
      {!loading && resolved.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SectionLabel label="Resolved" count={resolved.length} />
          {resolved.map(req => (
            <RequestCard key={req.id} req={req} acting={acting} resolved />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && requests.length === 0 && !error && (
        <div className="ambient-shadow" style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '2rem', padding: '5rem', textAlign: 'center' }}>
          <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: '700', fontSize: '1rem' }}>No requests yet</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-secondary-container)', marginTop: '0.25rem' }}>
            When teachers submit attendance requests, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-secondary-container)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-secondary-container)', borderRadius: '9999px', padding: '0.1rem 0.6rem' }}>
        {count}
      </span>
    </div>
  );
}

function RequestCard({ req, acting, onApprove, onReject, resolved }) {
  const isActing = acting === req.id;
  const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="ambient-shadow" style={{
      backgroundColor: 'var(--surface-container-lowest)',
      borderRadius: '1.75rem',
      padding: '1.5rem 1.75rem',
      display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      opacity: resolved ? 0.7 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--secondary-container), var(--primary-fixed))',
          color: 'var(--on-primary-fixed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '0.8rem', fontFamily: 'Manrope, sans-serif', flexShrink: 0,
        }}>
          {req.avatar}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{req.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--on-secondary-container)' }}>{req.subject}</div>
        </div>
      </div>

      {/* Date */}
      <div style={{ minWidth: '140px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.2rem' }}>Date</div>
        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{fmtDate(req.date)}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--on-secondary-container)' }}>
          Submitted {fmtTime(req.createdAt)}
        </div>
      </div>

      {/* Note */}
      {req.note && (
        <div style={{ flex: 2, minWidth: '160px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--on-secondary-container)', marginBottom: '0.2rem' }}>Note</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--on-secondary-container)', fontStyle: 'italic' }}>"{req.note}"</p>
        </div>
      )}

      {/* Actions / Status */}
      {!resolved ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => onApprove(req)}
            disabled={isActing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.6rem 1.25rem', borderRadius: '0.875rem', backgroundColor: 'var(--present-bg)', color: 'var(--present)', fontWeight: '700', fontSize: '0.82rem', border: 'none', cursor: isActing ? 'not-allowed' : 'pointer', opacity: isActing ? 0.6 : 1 }}
          >
            <Check size={15} /> {isActing ? '…' : 'Approve'}
          </button>
          <button
            onClick={() => onReject(req)}
            disabled={isActing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.6rem 1.25rem', borderRadius: '0.875rem', backgroundColor: 'var(--absent-bg)', color: 'var(--absent)', fontWeight: '700', fontSize: '0.82rem', border: 'none', cursor: isActing ? 'not-allowed' : 'pointer', opacity: isActing ? 0.6 : 1 }}
          >
            <X size={15} /> {isActing ? '…' : 'Reject'}
          </button>
        </div>
      ) : (
        <div style={{ flexShrink: 0 }}>
          <span className={`pill ${req.status === 'approved' ? 'pill-success' : 'pill-danger'}`}>
            {req.status === 'approved' ? 'Approved' : 'Rejected'}
          </span>
          {req.resolvedAt && (
            <div style={{ fontSize: '0.7rem', color: 'var(--on-secondary-container)', marginTop: '0.25rem', textAlign: 'center' }}>
              {fmtTime(req.resolvedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
