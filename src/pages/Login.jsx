import { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState(false);
  const [shaking, setShaking]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = onLogin(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div
        className="ambient-shadow"
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          borderRadius: '2.5rem',
          padding: '3rem',
          width: '100%',
          maxWidth: '400px',
          animation: shaking ? 'shake 0.4s ease' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
          <img
            src="/Logo.jpg"
            alt="GHS Khanpur"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', boxShadow: '0 4px 20px rgba(0,64,161,0.2)' }}
          />
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
            GHS Khanpur
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-secondary-container)', marginTop: '0.25rem' }}>
            Principal Admin Portal
          </p>
        </div>

        {/* Lock icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '1rem',
          background: 'linear-gradient(135deg, #0040a1, #1a6fe8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 4px 12px rgba(0,64,161,0.3)',
        }}>
          <Lock size={22} color="#fff" />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                autoFocus
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--on-secondary-container)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: 'var(--absent-bg)', borderRadius: '0.875rem', padding: '0.875rem 1rem', color: 'var(--absent)' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>Incorrect password. Try again.</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '1rem', fontSize: '0.95rem', borderRadius: '1.25rem', marginTop: '0.25rem' }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--on-secondary-container)', marginTop: '2rem' }}>
          This portal is restricted to school administration only.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
