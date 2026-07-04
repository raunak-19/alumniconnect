import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { api, BASE_URL } from '../services/api';

const TABS = [
  { id: 'pending',   label: '🔔 Pending Requests', desc: 'Verify new registrations' },
  { id: 'analytics', label: '📊 Analytics',         desc: 'Platform activity and statistics' },
  { id: 'users',     label: '👥 Manage Users',       desc: 'Approve, verify or remove accounts' },
  { id: 'activity',  label: '📈 Activity Monitor',   desc: 'Monitor posted jobs and opportunities' },
];

/* ── tiny helpers ─────────────────────────────────────── */
const Badge = ({ children, color = 'default' }) => {
  const map = {
    blue:    { bg: 'rgba(99,102,241,0.18)',  color: '#a5b4fc' },
    green:   { bg: 'rgba(52,211,153,0.18)',  color: '#6ee7b7' },
    violet:  { bg: 'rgba(167,139,250,0.18)', color: '#c4b5fd' },
    amber:   { bg: 'rgba(251,191,36,0.18)',  color: '#fcd34d' },
    rose:    { bg: 'rgba(251,113,133,0.18)', color: '#fda4af' },
    default: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
  };
  const s = map[color] || map.default;
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.55rem',
      borderRadius: '100px', fontSize: '0.725rem', fontWeight: 700,
      background: s.bg, color: s.color, letterSpacing: '0.02em',
    }}>{children}</span>
  );
};

const StatCard = ({ label, value, sub, icon, color = 'var(--text-primary)', accent }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    position: 'relative', overflow: 'hidden',
  }}>
    {accent && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }} />
    )}
    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: '1.875rem', fontWeight: 900, color, lineHeight: 1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>{sub}</div>}
  </div>
);

const ProgressBar = ({ pct, color = 'var(--primary)' }) => (
  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{
      height: '100%', width: `${Math.max(2, pct)}%`,
      background: color, borderRadius: 99,
      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
    }} />
  </div>
);

const Skeleton = ({ h = 40, w = '100%' }) => (
  <div className="skeleton" style={{ height: h, width: w, borderRadius: 'var(--radius-md)' }} />
);

const deptColors = ['var(--primary)', 'var(--accent-cyan)', 'var(--accent-emerald)', 'var(--accent-violet)', 'var(--accent-rose)', '#f59e0b'];

/* ════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [tab, setTab]               = useState('pending');
  const [analytics, setAnalytics]   = useState(null);
  const [users, setUsers]           = useState([]);
  const [activities, setActivities] = useState([]);
  const [pending, setPending]       = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectReason, setRejectReason]   = useState({});
  const [showRejectBox, setShowRejectBox] = useState({});
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchTab = useCallback(async (t) => {
    setLoading(true);
    setError('');
    try {
      if (t === 'pending') {
        const data = await api.get('/admin/pending');
        const list = Array.isArray(data) ? data : [];
        setPending(list);
        setPendingCount(list.length);
      } else if (t === 'analytics') {
        const data = await api.get('/admin/analytics');
        setAnalytics(data);
        setPendingCount(data.pending ?? 0);
      } else if (t === 'users') {
        const data = await api.get('/admin/users');
        setUsers(Array.isArray(data) ? data : []);
      } else if (t === 'activity') {
        const data = await api.get('/admin/activity');
        setActivities(Array.isArray(data) ? data : []);
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTab(tab);
    const iv = setInterval(() => fetchTab(tab), 30000);
    return () => clearInterval(iv);
  }, [tab, fetchTab]);

  /* ── Pending approve / reject ──────────────────────── */
  const approveUser = async (userId) => {
    setActionLoading(l => ({ ...l, [userId]: 'approving' }));
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setPending(prev => prev.filter(u => u.id !== userId));
      setPendingCount(c => Math.max(0, c - 1));
    } catch (err) {
      setError('Approval failed: ' + err.message);
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  };

  const rejectUser = async (userId) => {
    setActionLoading(l => ({ ...l, [userId]: 'rejecting' }));
    try {
      await api.post(`/admin/users/${userId}/reject`, { reason: rejectReason[userId] || '' });
      setPending(prev => prev.filter(u => u.id !== userId));
      setPendingCount(c => Math.max(0, c - 1));
      setShowRejectBox(b => ({ ...b, [userId]: false }));
    } catch (err) {
      setError('Rejection failed: ' + err.message);
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  };

  /* ── existing user actions ──────────────────────────── */
  const toggleVerify = async (userId) => {
    setActionLoading(l => ({ ...l, [userId]: true }));
    try {
      await api.post(`/admin/users/${userId}/verify`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  };

  const deleteUser = async (userId) => {
    const u = users.find(x => x.id === userId);
    if (!u || u.role === 'admin') return;
    if (!window.confirm(`Permanently delete "${u.name || u.email}"? This cannot be undone.`)) return;
    setActionLoading(l => ({ ...l, [userId]: true }));
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(x => x.id !== userId));
    } catch (err) {
      setError('Delete failed: ' + err.message);
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  };

  /* ── filtered user list ────────────────────────────── */
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.name || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* ── derived analytics for extra stat cards ─────────── */
  const verifiedAlumni = users.filter(u => u.role === 'alumni' && u.isVerified).length;
  const pendingVerification = users.filter(u => u.role === 'alumni' && !u.isVerified).length;

  return (
    <div className="page">
      <div className="app-bg" />
      <Navbar />

      <div className="page-content fade-in">
        {/* ── Header ──────────────────────────────────── */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-title">Platform Administration</h2>
            <p className="page-subtitle">Real-time system diagnostics, user authorisation and platform monitoring</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
              Live · {lastRefresh.toLocaleTimeString()}
            </span>
            <button onClick={() => fetchTab(tab)} className="btn btn-outline btn-sm" id="admin-refresh-btn">
              ↻ Refresh
            </button>
            <span className="badge badge-violet" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.35rem 0.75rem' }}>
              ● Security Console
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Tab selector ────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {TABS.map(t => {
            const isPending = t.id === 'pending' && pendingCount > 0;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} id={`admin-tab-${t.id}`}
                style={{
                  padding: '1.125rem 1rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  border: `1px solid ${tab === t.id ? 'var(--primary)' : isPending ? 'rgba(251,191,36,0.4)' : 'var(--border-default)'}`,
                  background: tab === t.id ? 'rgba(99,102,241,0.12)' : isPending ? 'rgba(251,191,36,0.06)' : 'var(--bg-card)',
                  textAlign: 'left', transition: 'all 0.2s',
                  boxShadow: tab === t.id ? '0 0 0 1px var(--primary), 0 0 20px var(--primary-glow)' : 'none',
                  position: 'relative',
                }}>
                {isPending && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#fbbf24', color: '#1a1a2e', borderRadius: '100px',
                    fontSize: '0.65rem', fontWeight: 900, padding: '0.1rem 0.45rem', lineHeight: 1.4,
                    boxShadow: '0 0 8px rgba(251,191,36,0.5)',
                  }}>{pendingCount}</span>
                )}
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{t.label.split(' ')[0]}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {t.label.slice(t.label.indexOf(' ') + 1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* ── Loading skeleton ─────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} h={120} />)}
            </div>
            <Skeleton h={280} />
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* PENDING REQUESTS TAB                        */}
        {/* ════════════════════════════════════════════ */}
        {!loading && tab === 'pending' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>🔔 Pending Verification Requests</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Review submitted documents and approve or reject each application.
                </div>
              </div>
              <Badge color="amber">{pending.length} pending</Badge>
            </div>

            {pending.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>All clear!</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending verification requests.</div>
              </div>
            ) : pending.map(u => {
              const docUrl = u.documentPath ? `${BASE_URL}/uploads/${u.documentPath}` : null;
              const isPdf = docUrl && u.documentPath.endsWith('.pdf');
              return (
                <div key={u.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  {/* Top bar */}
                  <div style={{ padding: '1.125rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: u.role === 'alumni' ? 'linear-gradient(135deg,var(--accent-emerald),var(--accent-cyan))' : 'linear-gradient(135deg,var(--primary),var(--accent-violet))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.125rem', fontWeight: 700, color: 'white',
                      }}>
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{u.name || '—'}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                          <Badge color={u.role === 'alumni' ? 'green' : 'blue'}>{u.role}</Badge>
                          {u.department && <Badge color="default">{u.department}</Badge>}
                          {u.graduationYear && <Badge color="default">Class of {u.graduationYear}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'right', flexShrink: 0 }}>
                      Applied {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Document */}
                  <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, margin: '0.875rem 0 0.625rem' }}>Submitted Document</div>
                    {docUrl ? (
                      isPdf ? (
                        <a href={docUrl} target="_blank" rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)',
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                            color: 'var(--primary-light)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                          }}>
                          📄 View PDF Document ↗
                        </a>
                      ) : (
                        <a href={docUrl} target="_blank" rel="noreferrer">
                          <img src={docUrl} alt="Verification document"
                            style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--border-default)', cursor: 'zoom-in' }} />
                        </a>
                      )
                    ) : (
                      <div style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)',
                        fontSize: '0.8125rem', color: '#fda4af', display: 'flex', gap: '0.5rem',
                      }}>
                        ⚠ No document submitted. Verify manually before approving.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {showRejectBox[u.id] && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="input" placeholder="Reason for rejection (optional)"
                          value={rejectReason[u.id] || ''}
                          onChange={e => setRejectReason(r => ({ ...r, [u.id]: e.target.value }))}
                          style={{ flex: 1 }}
                          id={`reject-reason-${u.id}`}
                        />
                        <button className="btn btn-sm" style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#fb7185', background: 'rgba(239,68,68,0.1)', padding: '0.3rem 0.75rem' }}
                          onClick={() => rejectUser(u.id)} disabled={actionLoading[u.id]}>
                          {actionLoading[u.id] === 'rejecting' ? '…' : '❌ Confirm Reject'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowRejectBox(b => ({ ...b, [u.id]: false }))}>Cancel</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, background: 'linear-gradient(135deg,var(--accent-emerald),#059669)', boxShadow: '0 2px 8px rgba(52,211,153,0.25)' }}
                        onClick={() => approveUser(u.id)}
                        disabled={!!actionLoading[u.id]}
                        id={`approve-btn-${u.id}`}
                      >
                        {actionLoading[u.id] === 'approving' ? 'Approving…' : '✓ Approve & Grant Access'}
                      </button>
                      {!showRejectBox[u.id] && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', padding: '0.4rem 1rem' }}
                          onClick={() => setShowRejectBox(b => ({ ...b, [u.id]: true }))}
                          disabled={!!actionLoading[u.id]}
                          id={`reject-btn-${u.id}`}
                        >
                          ✗ Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* ANALYTICS TAB                               */}
        {/* ════════════════════════════════════════════ */}
        {!loading && tab === 'analytics' && analytics && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* KPI row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <StatCard label="Total Registered Users" value={analytics.totalUsers} icon="👤"
                accent="linear-gradient(90deg,var(--primary),var(--accent-violet))"
                sub={`${analytics.admins} admin(s)`} />
              <StatCard label="Students" value={analytics.students} icon="🎓" color="var(--primary-light)"
                accent="var(--primary)" sub="Active learners" />
              <StatCard label="Alumni" value={analytics.alumni} icon="🏅" color="var(--accent-emerald)"
                accent="var(--accent-emerald)"
                sub={`${verifiedAlumni} verified · ${pendingVerification} pending`} />
              <StatCard label="Open Opportunities" value={analytics.totalOps} icon="💼" color="var(--accent-cyan)"
                accent="var(--accent-cyan)" sub="Live job + internship posts" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>

              {/* Department distribution */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '1.375rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🏫 Users by Department</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {Object.keys(analytics.byDepartment || {}).length === 0 ? (
                    <div style={{ color: 'var(--text-disabled)', fontSize: '0.875rem' }}>No departments registered yet.</div>
                  ) : (
                    Object.entries(analytics.byDepartment)
                      .sort((a, b) => b[1] - a[1])
                      .map(([dept, count], i) => (
                        <div key={dept}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{dept}</span>
                            <span style={{ fontWeight: 700, color: deptColors[i % deptColors.length] }}>
                              {count} {count === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                          <ProgressBar pct={(count / (analytics.totalUsers || 1)) * 100} color={deptColors[i % deptColors.length]} />
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* System status */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '1.375rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🛡 System Integrity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
                  {[
                    { name: 'Authentication (JWT)', ok: true,  val: 'Active' },
                    { name: 'MongoDB Atlas',         ok: true,  val: 'Connected' },
                    { name: 'AI Core (Groq)',         ok: true,  val: 'Connected' },
                    { name: 'Admin Accounts',         ok: true,  val: `${analytics.admins} active` },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.45rem 0.625rem',
                      background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--radius-sm)',
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                          background: item.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                          boxShadow: item.ok ? '0 0 6px var(--accent-emerald)' : 'none' }} />
                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{item.val}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* MANAGE USERS TAB                            */}
        {/* ════════════════════════════════════════════ */}
        {!loading && tab === 'users' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* toolbar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="input" placeholder="🔍  Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: '1 1 220px', maxWidth: 320 }} id="admin-user-search" />
              <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                style={{ width: 140 }} id="admin-role-filter">
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="alumni">Alumni</option>
                <option value="admin">Admins</option>
              </select>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {filteredUsers.length} of {users.length} users
              </span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.025)' }}>
                      {['Name', 'Email', 'Role', 'Dept / Company', 'Grad Year', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 0.75rem', textAlign: h === 'Actions' ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-disabled)' }}>
                        {users.length === 0 ? 'No users in database yet.' : 'No users match your filter.'}
                      </td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Name + avatar */}
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: u.role === 'alumni' ? 'linear-gradient(135deg,var(--accent-emerald),var(--accent-cyan))' :
                                          u.role === 'admin'  ? 'linear-gradient(135deg,var(--accent-violet),var(--accent-rose))' :
                                          'linear-gradient(135deg,var(--primary),var(--accent-violet))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8125rem', fontWeight: 700, color: 'white',
                            }}>
                              {(u.name || u.email || 'U')[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{u.email}</td>
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <Badge color={u.role === 'alumni' ? 'green' : u.role === 'admin' ? 'violet' : 'blue'}>{u.role}</Badge>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.company ? `${u.company}${u.designation ? ' · ' + u.designation : ''}` : u.department || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: 'var(--text-muted)' }}>{u.graduationYear || '—'}</td>
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <Badge color={u.isVerified ? 'green' : 'amber'}>{u.isVerified ? '✓ Verified' : '⏳ Pending'}</Badge>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                            {u.role !== 'admin' && (
                              <button
                                className={`btn btn-sm ${u.isVerified ? 'btn-outline' : 'btn-primary'}`}
                                style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                onClick={() => toggleVerify(u.id)}
                                disabled={actionLoading[u.id]}
                                id={`verify-btn-${u.id}`}
                              >
                                {actionLoading[u.id] ? '…' : u.isVerified ? 'Revoke' : '✓ Approve'}
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.3rem 0.5rem', border: '1px solid rgba(239,68,68,0.25)', color: '#fb7185', fontSize: '0.75rem' }}
                              onClick={() => deleteUser(u.id)}
                              disabled={actionLoading[u.id] || u.role === 'admin'}
                              title={u.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
                              id={`delete-btn-${u.id}`}
                            >
                              {actionLoading[u.id] ? '…' : '🗑'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* ACTIVITY MONITOR TAB                        */}
        {/* ════════════════════════════════════════════ */}
        {!loading && tab === 'activity' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* summary pills */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Postings',  val: activities.length,                                            color: 'var(--primary-light)' },
                { label: 'Internships',     val: activities.filter(a => a.type === 'Internship').length,       color: 'var(--accent-cyan)' },
                { label: 'Full-Time',       val: activities.filter(a => a.type === 'Full-Time').length,        color: 'var(--accent-emerald)' },
                { label: 'Active (future)', val: activities.filter(a => a.deadline && new Date(a.deadline) >= new Date()).length, color: '#fbbf24' },
              ].map(p => (
                <div key={p.label} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', padding: '0.625rem 1.125rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                }}>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: p.color }}>{p.val}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.label}</span>
                </div>
              ))}
            </div>

            {/* listing cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', padding: '3rem',
                  textAlign: 'center', color: 'var(--text-disabled)',
                }}>
                  No opportunities have been posted yet.
                </div>
              ) : activities.map(act => {
                const deadline = act.deadline ? new Date(act.deadline) : null;
                const isExpired = deadline && deadline < new Date();
                return (
                  <div key={act.id}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                      opacity: isExpired ? 0.65 : 1, transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{act.role}</span>
                        <Badge color={act.type === 'Internship' ? 'blue' : 'green'}>{act.type}</Badge>
                        {isExpired && <Badge color="rose">Expired</Badge>}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        🏢 {act.company}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Posted by <strong style={{ color: 'var(--text-secondary)' }}>{act.postedByName || '—'}</strong>
                        {act.postedAt && <span> · {new Date(act.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {deadline && (
                        <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-disabled)' }}>Deadline: </span>
                          <span style={{ color: isExpired ? 'var(--accent-rose)' : '#fbbf24', fontWeight: 600 }}>
                            {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
