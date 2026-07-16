import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AICopilot from './AICopilot';
import ResumeGenerator from './ResumeGenerator';
import ReferralPortal from '../components/ReferralPortal';
import InboxPanel from '../components/InboxPanel';
import ConnectModal from '../components/ConnectModal';
import { API_URL } from '../services/api';
const token = () => localStorage.getItem('alumniconnect_token');

const TABS = [
  { id: 'overview', label: '🏠 Overview' },
  { id: 'inbox', label: '💬 Messages' },
  { id: 'referrals', label: '🤝 Referral Portal & Directory' },
  { id: 'students', label: '👥 Student Directory' },
  { id: 'resume', label: '📄 Resume Builder' },
  { id: 'copilot', label: '🤖 AI Assistant' },
  { id: 'profile', label: '👤 Profile' },
];

function ProfileSection({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    company: user?.company || '',
    designation: user?.designation || '',
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, skills })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate?.({ ...user, ...updated });
        setEditing(false);
      }
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'white', boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
          }}>
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
              <span className="badge badge-green">Alumni</span>
              <span className="badge badge-default">Class of {user?.graduationYear}</span>
            </div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(e => !e)}>
          {editing ? 'Cancel' : '✏ Edit'}
        </button>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="grid-2">
            {[
              { k: 'name', l: 'Full Name', ph: 'Your name' },
              { k: 'department', l: 'Department', ph: 'CSE' },
              { k: 'company', l: 'Company', ph: 'Google, Microsoft…' },
              { k: 'designation', l: 'Designation', ph: 'Software Engineer' },
            ].map(f => (
              <div key={f.k} className="field">
                <label className="label">{f.l}</label>
                <input className="input" placeholder={f.ph} value={form[f.k]}
                  onChange={e => setForm(x => ({ ...x, [f.k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="field">
            <label className="label">Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {skills.map(s => (
                <span key={s} className="tag">{s}
                  <button className="tag-remove" onClick={() => setSkills(skills.filter(x => x !== s))}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input input-sm" placeholder="Add skill" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <button className="btn btn-outline btn-sm" onClick={addSkill}>Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} onClick={save}>Save</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            {[
              { l: 'Department', v: user?.department },
              { l: 'Graduation Year', v: user?.graduationYear },
              { l: 'Company', v: user?.company },
              { l: 'Designation', v: user?.designation },
            ].map(f => (
              <div key={f.l}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{f.l}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{f.v || '—'}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {(user?.skills || []).map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Profile Modal ─────────────────────────────────────────────────
function StudentProfileModal({ student, onClose, onConnect }) {
  if (!student) return null;
  const avatarGrads = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#ec4899,#db2777)',
  ];
  const grad = avatarGrads[(student.name?.charCodeAt(0) || 0) % avatarGrads.length];
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem',
    }} onClick={onClose}>
      <div className="card" style={{
        width: '100%', maxWidth: '480px', position: 'relative',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          height: 72, borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.2))',
          margin: '-1.5rem -1.5rem 0 -1.5rem', marginBottom: '1rem', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 16,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>×</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginTop: '-2rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: grad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.375rem', color: 'white',
              border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              {(student.name || 'S')[0].toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{student.name}</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {student.department && <span className="badge badge-blue">🎓 {student.department}</span>}
            {student.graduationYear && <span className="badge badge-default">Class of {student.graduationYear}</span>}
          </div>
        </div>
        {student.skills?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SKILLS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {student.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}
        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { onConnect(student); onClose(); }}>
          💬 Connect (Message)
        </button>
      </div>
    </div>
  );
}

// ─── Student Directory Tab ──────────────────────────────────────────────────
function StudentDirectoryTab({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [connectTarget, setConnectTarget] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);

  const avatarGrads = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#ec4899,#db2777)',
  ];
  const getGrad = (name) => avatarGrads[(name?.charCodeAt(0) || 0) % avatarGrads.length];

  const fetchStudents = async (q = '', dept = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (dept) params.append('department', dept);
      const tk = localStorage.getItem('alumniconnect_token');
      const res = await fetch(`${API_URL}/alumni/students/search?${params}`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data.filter(s => s.id?.toString() !== user?.id?.toString() && s.id?.toString() !== user?._id?.toString()) : []);
    } catch (e) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>Student Directory</h2>
        <p className="page-subtitle">Connect with verified NIT JSR students</p>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" placeholder="Search by name, department, or skill…"
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchStudents(searchQ, searchDept)}
          style={{ flex: 1, minWidth: '200px' }} />
        <input className="input" placeholder="Department (e.g. CSE, EE)"
          value={searchDept} onChange={e => setSearchDept(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchStudents(searchQ, searchDept)}
          style={{ width: '200px' }} />
        <button className="btn btn-primary" onClick={() => fetchStudents(searchQ, searchDept)}>Search</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(n => <div key={n} className="card"><div className="skeleton" style={{ height: 70 }} /></div>)}
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎓</div>
          No students found matching your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {students.map(student => (
            <div key={student.id?.toString()} className="card" style={{ transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px', cursor: 'pointer' }}
                  onClick={() => setViewProfile(student)}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: getGrad(student.name), flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: 'white', fontSize: '1.125rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}>
                    {(student.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{student.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {student.department && <span>{student.department}</span>}
                      {student.graduationYear && <span> · Class of {student.graduationYear}</span>}
                    </div>
                    {student.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
                        {student.skills.slice(0, 4).map(s => <span key={s} className="tag" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{s}</span>)}
                        {student.skills.length > 4 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{student.skills.length - 4}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setViewProfile(student)} style={{ fontSize: '0.75rem' }}>
                    View Profile
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setConnectTarget({ id: student.id?.toString(), name: student.name })} style={{ fontSize: '0.75rem' }}>
                    💬 Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewProfile && (
        <StudentProfileModal
          student={viewProfile}
          onClose={() => setViewProfile(null)}
          onConnect={(s) => setConnectTarget({ id: s.id?.toString(), name: s.name })}
        />
      )}

      {connectTarget && (
        <ConnectModal
          recipient={connectTarget}
          onClose={() => setConnectTarget(null)}
        />
      )}
    </div>
  );
}

export default function AlumniDashboard({ user, setUser }) {
  const [tab, setTab] = useState('overview');
  const [allAlumni, setAllAlumni] = useState([]);
  const [alumniIndex, setAlumniIndex] = useState(0);
  const [connectTarget, setConnectTarget] = useState(null);
  const [inboxCount, setInboxCount] = useState(0);
  const [referralStats, setReferralStats] = useState({ incoming: 0, posted: 0 });
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showProfileBanner, setShowProfileBanner] = useState(false);

  const fetchDashboardData = () => {
    const tk = token();
    if (!tk) return;

    // Fetch alumni search for rotation
    fetch(`${API_URL}/alumni/search`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllAlumni(data.filter(a => a.id?.toString() !== user?._id?.toString() && a.id?.toString() !== user?.id?.toString()));
        }
      }).catch(() => {});

    // Messages inbox count
    fetch(`${API_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInboxCount(data.length); })
      .catch(() => {});

    // Incoming Referral requests stats
    fetch(`${API_URL}/alumni/referral-requests/incoming`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setReferralStats({ incoming: data.length });
      }).catch(() => {});

    // Notifications
    fetch(`${API_URL}/dashboard/notifications`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});

    // Activities
    fetch(`${API_URL}/dashboard/activities`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setActivities(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Profile completion check
  useEffect(() => {
    if (!user) return;
    const dismissed = sessionStorage.getItem('profile_banner_dismissed_alumni');
    if (dismissed) return;
    const isIncomplete = !user.department || !user.company || !user.designation || !(user.skills?.length > 0);
    setShowProfileBanner(isIncomplete);
  }, [user]);

  // Rotate alumni every 4s
  useEffect(() => {
    if (allAlumni.length <= 1) return;
    const iv = setInterval(() => setAlumniIndex(p => (p + 1) % allAlumni.length), 4000);
    return () => clearInterval(iv);
  }, [allAlumni]);

  const activeAlum = allAlumni[alumniIndex];

  const handleTabChange = async (id) => {
    setTab(id);
    if (id === 'inbox') {
      setInboxCount(0);
      const tk = token();
      try {
        await fetch(`${API_URL}/dashboard/notifications/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tk}` }
        });
      } catch (_) {}
    }
  };

  const markNotificationsRead = async () => {
    const tk = token();
    try {
      await fetch(`${API_URL}/dashboard/notifications/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tk}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="page">
      <div className="app-bg" />
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="page-title">
                Welcome back,{' '}
                <span className="gradient-text">{(user?.name || 'Alumni').split(' ')[0]}</span> 👋
              </h2>
              <p className="page-subtitle">
                {user?.designation || 'Engineer'}{user?.company ? ` at ${user.company}` : ''} · Class of {user?.graduationYear}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleTabChange('inbox')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                💬 Messages
                {inboxCount > 0 && (
                  <span style={{
                    background: 'var(--primary)', color: 'white',
                    borderRadius: '100px', fontSize: '0.625rem', fontWeight: 800,
                    padding: '0.15rem 0.45rem', minWidth: 18, textAlign: 'center',
                    lineHeight: 1.4, display: 'inline-block',
                  }}>{inboxCount}</span>
                )}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleTabChange('referrals')}>
                🤝 Referral Portal
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.75rem' }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => handleTabChange(t.id)} id={`alumni-tab-${t.id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              {t.label}
              {t.id === 'inbox' && inboxCount > 0 && (
                <span style={{
                  background: 'var(--primary)', color: 'white',
                  borderRadius: '100px', fontSize: '0.625rem', fontWeight: 800,
                  padding: '0.1rem 0.4rem', minWidth: 18, textAlign: 'center',
                  display: 'inline-block', lineHeight: 1.4,
                }}>{inboxCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="fade-in">
            {/* Profile Completion Banner */}
            {showProfileBanner && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
                border: '1px solid rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌟</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>Your profile is incomplete!</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Add your company, designation & skills so students can find you and request referrals.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}
                    onClick={() => handleTabChange('profile')}>Complete Profile →</button>
                  <button onClick={() => { setShowProfileBanner(false); sessionStorage.setItem('profile_banner_dismissed_alumni', '1'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                </div>
              </div>
            )}

            {/* Notification alert banner */}
            {unreadNotifications.length > 0 && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔔</span>
                  <strong>{unreadNotifications.length} New Notification(s):</strong> {unreadNotifications[0].content}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={markNotificationsRead} style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Mark all read
                </button>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-label">Referral Requests</div>
                <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{referralStats.incoming}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Incoming requests from students</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Your Contribution Score</div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{user?.contributionPoints || 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Earned from referral tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Unread Messages</div>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{inboxCount}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>In your inbox</div>
              </div>
            </div>

            {/* 2-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              {/* Left Column: Recent Activity Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>⚡ Recent Network Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {activities.length === 0 ? (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent activity recorded yet.</div>
                    ) : (
                      activities.map(act => (
                        <div key={act._id} style={{ fontSize: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{act.userName}</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>({act.userRole})</span>{' '}
                          <span style={{ color: 'var(--text-muted)' }}>{act.details}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Live Alumni Carousel */}
              <div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 320 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>👥 Fellow Alumni</span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Live</span>
                  </div>

                  {activeAlum ? (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '1rem 0', flex: 1 }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.5rem', color: 'white',
                        margin: '0 auto 1rem auto', boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      }}>
                        {(activeAlum.name || 'A')[0].toUpperCase()}
                      </div>
                      <div style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        {activeAlum.name}
                        {activeAlum.isVerified && <span style={{ color: '#34d399', marginLeft: '0.375rem', fontSize: '0.875rem' }}>✓</span>}
                      </div>
                      {activeAlum.company && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                          {activeAlum.designation || 'Alumni'} <span style={{ color: 'var(--text-muted)' }}>at</span>{' '}
                          <span style={{ color: '#fbbf24' }}>{activeAlum.company}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {activeAlum.department} · Class of {activeAlum.graduationYear}
                      </div>
                      <button
                        className="btn btn-outline btn-sm btn-full"
                        style={{ marginTop: '1.25rem' }}
                        onClick={() => setConnectTarget({ id: activeAlum.id?.toString(), name: activeAlum.name, designation: activeAlum.designation, company: activeAlum.company })}
                      >
                        💬 Connect
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', flex: 1 }}>
                      No other alumni yet.
                    </div>
                  )}

                  {/* Dots */}
                  {allAlumni.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '0.75rem' }}>
                      {allAlumni.slice(0, 7).map((_, i) => (
                        <div key={i}
                          onClick={() => setAlumniIndex(i)}
                          style={{
                            width: i === alumniIndex ? 16 : 6,
                            height: 6, borderRadius: '100px',
                            background: i === alumniIndex ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                            cursor: 'pointer', transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INBOX ── */}
        {tab === 'inbox' && (
          <div className="fade-in">
            <div className="card">
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>💬 Messages</div>
              <InboxPanel user={user} />
            </div>
          </div>
        )}

        {/* ── REFERRAL NETWORK & DIRECTORY (CONSOLIDATED) ── */}
        {tab === 'referrals' && <div className="fade-in"><ReferralPortal user={user} isAlumni={true} /></div>}
        {tab === 'students' && <div className="fade-in"><StudentDirectoryTab user={user} /></div>}
        {tab === 'resume' && <div className="fade-in"><ResumeGenerator user={user} /></div>}
        {tab === 'copilot' && <div className="fade-in"><AICopilot user={user} /></div>}
        {tab === 'profile' && <div className="fade-in"><ProfileSection user={user} onUpdate={setUser} /></div>}
      </div>

      {/* Connect Modal */}
      {connectTarget && (
        <ConnectModal
          recipient={connectTarget}
          onClose={() => { setConnectTarget(null); fetchDashboardData(); }}
        />
      )}
    </div>
  );
}
