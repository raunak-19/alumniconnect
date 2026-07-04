import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const features = [
  { icon: '🎯', title: 'AI Career Copilot', desc: 'Groq-powered resume analysis, ATS scoring & roadmaps' },
  { icon: '📄', title: 'Smart Resume Builder', desc: 'ATS-friendly engineering resume with live preview' },
  { icon: '🔗', title: 'Alumni Network', desc: 'Connect with NIT Jamshedpur alumni at top companies' },
  { icon: '🚀', title: 'Referral Portal', desc: 'Get referrals from verified alumni in your target firms' },
];

export default function Login() {
  const { login, continueAsGuest } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(''); // 'pending' | 'rejected'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setVerificationState('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Check if backend sent a verificationStatus hint
      const msg = err.message || '';
      if (msg.includes('awaiting admin verification') || msg.includes('pending')) {
        setVerificationState('pending');
      } else if (msg.includes('rejected') || msg.includes('registration was rejected')) {
        setVerificationState('rejected');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="page" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="app-bg" />

      {/* Left panel */}
      <div style={{
        flex: '0 0 44%',
        background: 'linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.08) 50%, rgba(34,211,238,0.06) 100%)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }} className="hide-mobile">
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div className="nav-logo-icon" style={{ width: 44, height: 44, fontSize: '1.125rem' }}>A</div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AlumniConnect</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>NIT Jamshedpur</div>
            </div>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Your career,{' '}
            <span className="gradient-text">supercharged</span>
            <br />by your alumni.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '340px' }}>
            The exclusive platform where NIT Jamshedpur students and alumni connect, refer, and grow together.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}
                className="fade-in" style2={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }} className="fade-in">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}
            className="show-mobile">
            <div className="nav-logo-icon">A</div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>AlumniConnect</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Sign in to your account to continue
            </p>
          </div>

          {verificationState === 'pending' && (
            <div style={{
              marginBottom: '1.25rem', padding: '1rem 1.125rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⏳</span>
              <div>
                <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: '0.25rem' }}>Account Pending Approval</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Your registration is under review by the placement cell admin. Please check back later.
                </div>
              </div>
            </div>
          )}
          {verificationState === 'rejected' && (
            <div style={{
              marginBottom: '1.25rem', padding: '1rem 1.125rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>❌</span>
              <div>
                <div style={{ fontWeight: 700, color: '#fb7185', marginBottom: '0.25rem' }}>Registration Rejected</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {error.replace('Invalid email or password.', '').trim() || 'Your registration was rejected. Please contact the placement cell.'}
                </div>
              </div>
            </div>
          )}
          {error && !verificationState && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <label className="label">University Email</label>
              <input
                className="input"
                type="email"
                placeholder="name@nitjsr.ac.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="login-email"
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="login-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center',
                  }}
                >{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full${loading ? ' btn-loading' : ''}`}
              disabled={loading}
              id="login-submit"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>or</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <button
            onClick={handleGuest}
            className="btn btn-outline btn-lg btn-full"
            id="guest-login"
          >
            Continue as Guest
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Are you an administrator?{' '}
            <Link to="/admin-login" style={{ color: 'var(--accent-violet)', fontWeight: 600 }} id="admin-login-link">
              Admin Access Console
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
