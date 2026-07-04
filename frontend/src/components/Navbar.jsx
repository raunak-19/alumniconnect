import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const roleBadge = {
  student: { label: 'Student', cls: 'badge-blue' },
  alumni: { label: 'Alumni', cls: 'badge-green' },
  admin: { label: 'Admin', cls: 'badge-violet' },
  guest: { label: 'Guest', cls: 'badge-default' },
};

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const rb = roleBadge[user?.role] || roleBadge.guest;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="nav-logo-icon">A</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              AlumniConnect
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
              NIT Jamshedpur
            </div>
          </div>
        </div>

        {/* User section */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {/* User info */}
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name || user.email?.split('@')[0] || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.email || 'Guest mode'}
              </div>
            </div>

            {/* Role badge */}
            <span className={`badge ${rb.cls}`}>{rb.label}</span>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
              boxShadow: '0 2px 8px var(--primary-glow)',
            }}>
              {(user.name || user.email || 'G')[0].toUpperCase()}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ border: '1px solid var(--border-default)' }}
              id="logout-btn"
            >
              {user.role === 'guest' ? 'Exit' : 'Log Out'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
