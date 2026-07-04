import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function AdminLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        throw new Error('Access denied. This portal is exclusively for system administrators.');
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="app-bg" />
      <div style={{ width: '100%', maxWidth: '420px' }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <div className="nav-logo-icon" style={{ background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-rose))' }}>A</div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>AlumniConnect Console</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Administrator Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            System monitoring, analytics & user management
          </p>
        </div>

        <div className="card card-xl">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="field">
              <label className="label">Admin Email</label>
              <input
                className="input"
                type="email"
                placeholder="admin@nitjsr.ac.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="admin-email"
              />
            </div>

            <div className="field">
              <label className="label">Access Key / Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="admin-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.125rem',
                  }}
                >{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full${loading ? ' btn-loading' : ''}`}
              style={{ background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-rose) 100%)', boxShadow: '0 2px 12px rgba(167, 139, 250, 0.25)' }}
              disabled={loading}
              id="admin-login-submit"
            >
              {loading ? 'Authenticating…' : 'Enter Control Panel →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Are you a user?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Student / Alumni Login
          </Link>
        </p>
      </div>
    </div>
  );
}
