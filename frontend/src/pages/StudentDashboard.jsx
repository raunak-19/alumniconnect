import React, { useState, useEffect, useRef } from 'react';
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
  { id: 'resume', label: '📄 Resume Builder' },
  { id: 'copilot', label: '🤖 AI Assistant' },
  { id: 'profile', label: '👤 Profile' },
];

function StatCard({ label, value, color, icon, subtitle }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
          {subtitle && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</div>}
        </div>
        <div style={{
          fontSize: '1.5rem', width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
      </div>
    </div>
  );
}

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
        const updatedProfile = await res.json();
        onUpdate?.({ ...user, ...updatedProfile });
        setEditing(false);
      }
    } catch (err) {
      alert('Failed to save profile changes.');
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
            background: 'linear-gradient(135deg, var(--primary), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'white',
            boxShadow: '0 4px 16px var(--primary-glow)',
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{user?.name || 'Your Name'}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
              <span className="badge badge-blue">{user?.department || 'No dept'}</span>
              <span className="badge badge-green">Class of {user?.graduationYear || '—'}</span>
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
              { key: 'name', label: 'Full Name', ph: 'Your name' },
              { key: 'department', label: 'Department', ph: 'CSE' },
              { key: 'company', label: 'Company', ph: 'Current company' },
              { key: 'designation', label: 'Designation', ph: 'Job title' },
            ].map(f => (
              <div key={f.key} className="field">
                <label className="label">{f.label}</label>
                <input className="input" placeholder={f.ph} value={form[f.key]}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div className="field">
            <label className="label">Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {skills.map(s => (
                <span key={s} className="tag">
                  {s}
                  <button className="tag-remove" onClick={() => setSkills(skills.filter(x => x !== s))}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input input-sm" placeholder="Add skill and press Enter"
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <button className="btn btn-outline btn-sm" onClick={addSkill}>Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} onClick={save}>Save Changes</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid-2" style={{ marginBottom: '1rem', gap: '1rem' }}>
            {[
              { label: 'Department', val: user?.department },
              { label: 'Graduation Year', val: user?.graduationYear },
              { label: 'Company', val: user?.company },
              { label: 'Designation', val: user?.designation },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{f.label}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{f.val || '—'}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {(user?.skills || []).length === 0
                ? <span style={{ fontSize: '0.875rem', color: 'var(--text-disabled)' }}>No skills added yet</span>
                : (user.skills || []).map(s => <span key={s} className="tag">{s}</span>)
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard({ user, setUser }) {
  const [tab, setTab] = useState('overview');
  const [oppCount, setOppCount] = useState(0);
  const [recommendedOpps, setRecommendedOpps] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [rotatingAlumni, setRotatingAlumni] = useState([]);
  const [alumniIndex, setAlumniIndex] = useState(0);
  const [connectTarget, setConnectTarget] = useState(null);
  const [inboxCount, setInboxCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  // Track current tab and last seen message count to prevent badge re-appearing
  const activeTabRef = useRef('overview');
  const lastSeenInboxCount = useRef(0);

  const placementInsights = {
    batch: "2023-2024 (Overall)",
    highestSalary: "₹83.0 LPA",
    averageSalary: "₹12.63 LPA",
    totalOffers: "750+",
    placementPercentage: "93.4%",
    topRecruiters: ["Google", "Amazon", "Juspay", "Salesforce", "Tata Motors", "Deloitte", "NVIDIA", "Qualcomm"]
  };

  const fetchDashboardData = () => {
    const tk = token();
    if (!tk) return;

    // Opportunities & recommended matching
    fetch(`${API_URL}/alumni/opportunities`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOppCount(data.length);
          
          // Filter recommended matches by skills
          const studentSkills = (user?.skills || []).map(s => s.toLowerCase());
          let recs = [];
          if (studentSkills.length > 0) {
            recs = data.filter(op =>
              op.skillsRequired?.some(skill => {
                const sl = skill.toLowerCase();
                return studentSkills.some(ss => ss.includes(sl) || sl.includes(ss));
              })
            );
          }
          // Fallback if no recommended matches found
          if (recs.length === 0) {
            recs = data.slice(0, 3);
          }
          setRecommendedOpps(recs.slice(0, 3));

          // upcoming deadlines sorting
          const futureOpps = data.filter(op => op.deadline && new Date(op.deadline) >= new Date());
          futureOpps.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
          setUpcomingDeadlines(futureOpps.slice(0, 3));
        }
      }).catch(() => {});

    // Verified rotating Mentors
    fetch(`${API_URL}/alumni/search`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRotatingAlumni(data.filter(a => a.isVerified).length > 0 ? data.filter(a => a.isVerified) : data);
        }
      }).catch(() => {});

    // Messages / inbox count — only show badge for genuinely NEW messages
    fetch(`${API_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const total = data.length;
          if (activeTabRef.current === 'inbox') {
            // User is viewing inbox right now — keep badge cleared & update baseline
            lastSeenInboxCount.current = total;
            setInboxCount(0);
          } else {
            // Show badge only for messages that arrived after the user last read inbox
            const newCount = Math.max(0, total - lastSeenInboxCount.current);
            setInboxCount(newCount);
          }
        }
      })
      .catch(() => {});

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

  // Rotate alumni carousel
  useEffect(() => {
    if (rotatingAlumni.length <= 1) return;
    const iv = setInterval(() => setAlumniIndex(prev => (prev + 1) % rotatingAlumni.length), 5000);
    return () => clearInterval(iv);
  }, [rotatingAlumni]);

  const activeAlum = rotatingAlumni[alumniIndex];

  const handleTabChange = async (id) => {
    setTab(id);
    activeTabRef.current = id;
    if (id === 'inbox') {
      setInboxCount(0);
      // Update baseline so the poller knows these messages were seen
      const tk = token();
      try {
        const res = await fetch(`${API_URL}/messages/inbox`, {
          headers: { Authorization: `Bearer ${tk}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) lastSeenInboxCount.current = data.length;
        }
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
                <span className="gradient-text">{(user?.name || 'Student').split(' ')[0]}</span> 👋
              </h2>
              <p className="page-subtitle">
                {user?.department || 'Engineering'} ({user?.department?.substring(0, 2).toUpperCase() || 'EE'}) · Class of {user?.graduationYear || '—'}
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
              onClick={() => handleTabChange(t.id)} id={`dash-tab-${t.id}`}
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

        {/* ── OVERVIEW / HOME PAGE ── */}
        {tab === 'overview' && (
          <div className="fade-in">
            {/* Notification Bar */}
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

            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <StatCard label="Opportunities Available" value={oppCount} color="var(--primary-light)" icon="💼"
                subtitle="Live internships & jobs" />
              <StatCard label="Resume ATS Score" value={user?.lastAtsScore || '—'} color="var(--accent-emerald)" icon="🎯"
                subtitle={user?.lastAtsScore ? 'Last checked score' : 'Run ATS check to get score'} />
              <StatCard label="Profile Skills" value={(user?.skills || []).length} color="var(--accent-cyan)" icon="⚙️"
                subtitle="Skills updated in MongoDB" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Left Column: Recommended & Upcoming Deadlines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Recommended Opportunities */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>✨ Recommended Opportunities</div>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Matched to Skills</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recommendedOpps.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No recommended jobs yet. Add skills to your profile to get matches!
                      </div>
                    ) : (
                      recommendedOpps.map(op => (
                        <div key={op._id} style={{
                          padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                          background: 'rgba(255,255,255,0.01)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.18s'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                        >
                          <div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                              {op.role} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>at</span>{' '}
                              <span style={{ color: '#fbbf24' }}>{op.company}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', borderRadius: '20px' }}>
                                {op.type}
                              </span>
                              {op.skillsRequired?.slice(0, 2).map(s => (
                                <span key={s} className="tag" style={{ fontSize: '0.7rem', padding: '0.125rem 0.375rem' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                          <button className="btn btn-outline btn-sm" onClick={() => setTab('referrals')}>
                            Apply →
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>⏳ Upcoming Deadlines</div>
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Apply Soon</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {upcomingDeadlines.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No deadlines listed.
                      </div>
                    ) : (
                      upcomingDeadlines.map(op => (
                        <div key={op._id} style={{
                          padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-default)',
                          background: 'rgba(255,255,255,0.01)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                              {op.role} at <span style={{ color: '#fbbf24' }}>{op.company}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem', fontWeight: 600 }}>
                              📅 Deadline: {new Date(op.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          <button className="btn btn-outline btn-sm" onClick={() => setTab('referrals')}>
                            View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Placement Insights */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>📊 NIT JSR Placement Insights</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Placements Portal</span>
                  </div>
                  <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Highest Package', value: placementInsights.highestSalary, color: 'var(--accent-amber)' },
                      { label: 'Average Package', value: placementInsights.averageSalary, color: 'var(--primary-light)' },
                      { label: 'Placement Rate', value: placementInsights.placementPercentage, color: 'var(--accent-emerald)' },
                      { label: 'Total Offers', value: placementInsights.totalOffers, color: 'var(--accent-cyan)' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color, marginTop: '0.25rem' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Verified Mentors & Recent Activity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Verified Mentor Rotator */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>🤝 Verified Mentors</span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Live Rotation</span>
                  </div>

                  {activeAlum ? (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.5rem', color: 'white',
                        margin: '0 auto 1rem auto', boxShadow: '0 4px 16px var(--primary-glow)',
                      }}>
                        {(activeAlum.name || 'A')[0].toUpperCase()}
                      </div>
                      <div style={{ fontSize: '1.0625rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                        {activeAlum.name}
                        <span style={{ color: '#34d399', fontSize: '0.875rem' }}>✓</span>
                      </div>
                      {activeAlum.company && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '0.25rem' }}>
                          {activeAlum.designation || 'Alumni Member'}{' '}
                          <span style={{ color: 'var(--text-muted)' }}>at</span>{' '}
                          <span style={{ color: '#fbbf24' }}>{activeAlum.company}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {activeAlum.department} · Class of {activeAlum.graduationYear}
                      </div>
                      <button
                        className="btn btn-outline btn-sm btn-full"
                        style={{ marginTop: '1rem' }}
                        onClick={() => setConnectTarget({ id: activeAlum.id?.toString(), name: activeAlum.name, designation: activeAlum.designation, company: activeAlum.company })}
                      >
                        💬 Connect with Alumni
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No verified mentors yet.</div>
                  )}
                </div>

                {/* Recent Activity Feed */}
                <div className="card">
                  <div style={{ fontSize: '1.00rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Recent Network Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {activities.length === 0 ? (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent activity.</div>
                    ) : (
                      activities.map(act => (
                        <div key={act._id} style={{ fontSize: '0.8125rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{act.userName}</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>({act.userRole})</span>{' '}
                          <span style={{ color: 'var(--text-muted)' }}>{act.details}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

        {/* ── REFERRAL PORTAL & DIRECTORY (CONSOLIDATED) ── */}
        {tab === 'referrals' && (
          <div className="fade-in">
            <ReferralPortal user={user} isAlumni={false} />
          </div>
        )}

        {tab === 'resume' && (
          <div className="fade-in">
            <ResumeGenerator user={user} setUser={setUser} />
          </div>
        )}

        {tab === 'copilot' && (
          <div className="fade-in">
            <AICopilot user={user} />
          </div>
        )}

        {tab === 'profile' && (
          <div className="fade-in">
            <ProfileSection user={user} onUpdate={setUser} />
          </div>
        )}
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
