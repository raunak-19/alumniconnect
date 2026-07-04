import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ConnectModal from './ConnectModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeColors = {
  'Referral Opportunity': { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#a5b4fc' },
  'Full-Time': { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#34d399' },
  'Internship': { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fbbf24' },
};
const getTypeColor = (t) => typeColors[t] || typeColors['Referral Opportunity'];

const getMedalEmoji = (rank) => {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return `#${rank + 1}`;
};

const avatarGradients = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
  'linear-gradient(135deg,#ec4899,#db2777)',
];
const getGrad = (name) => avatarGradients[(name?.charCodeAt(0) || 0) % avatarGradients.length];

// ─── Alumni Profile Modal ─────────────────────────────────────────────────────
function AlumniProfileModal({ alumni, onClose, onGetReferral, onConnect, isAlumni }) {
  if (!alumni) return null;
  const statusColor = alumni.contributionPoints >= 100 ? '#fbbf24' : alumni.contributionPoints >= 50 ? '#a5b4fc' : '#34d399';
  const statusLabel = alumni.contributionPoints >= 100 ? '⭐ Top Contributor' : alumni.contributionPoints >= 50 ? '🤝 Active Mentor' : '✨ Contributor';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem',
    }} onClick={onClose}>
      <div className="card" style={{
        width: '100%', maxWidth: '500px', position: 'relative',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
      }} onClick={e => e.stopPropagation()}>
        {/* Banner */}
        <div style={{
          height: 80, borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.2))',
          margin: '-1.5rem -1.5rem 0 -1.5rem',
          marginBottom: '1rem',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 16,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>×</button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginTop: '-2.25rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: getGrad(alumni.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.5rem', color: 'white',
              border: '3px solid var(--bg-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              {(alumni.name || 'A')[0].toUpperCase()}
            </div>
            {alumni.isVerified && (
              <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.125rem 0.5rem', borderRadius: '20px', marginBottom: '0.25rem' }}>✓ Verified</span>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>{alumni.contributionPoints || 0}</div>
            <div style={{ fontSize: '0.75rem', color: statusColor }}>{statusLabel}</div>
          </div>
        </div>

        {/* Info */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{alumni.name}</div>
          {(alumni.designation || alumni.company) && (
            <div style={{ fontSize: '1rem', color: 'var(--primary-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {alumni.designation || 'Alumni Member'}
              {alumni.company && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> at </span>
                  <span style={{ color: '#fbbf24' }}>{alumni.company}</span>
                </>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-default">🎓 {alumni.department}</span>
            <span className="badge badge-default">Class of {alumni.graduationYear}</span>
          </div>
        </div>

        {/* Skills */}
        {alumni.skills?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>EXPERTISE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {alumni.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { onConnect(alumni); onClose(); }}>
            💬 Connect (Message)
          </button>
          {!isAlumni && (
            <button className="btn btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}
              onClick={() => { onGetReferral(alumni); onClose(); }}>
              ✨ Request Referral
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Referral Request Modal ───────────────────────────────────────────────────
function RequestModal({ target, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(message);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Request Referral</div>
            {target.company && (
              <div style={{ fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>For </span>
                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{target.role}</span>
                <span style={{ color: 'var(--text-muted)' }}> at </span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{target.company}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}>×</button>
        </div>

        <div style={{
          padding: '0.875rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>💡 TIP: A great request should include:</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your name, department & year · Relevant skills & projects · Why you want this role · Why you're a good fit
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label className="label">Your Message to the Alumni</label>
            <textarea className="textarea" rows={7} required
              placeholder={`Hi [Alumni Name],\n\nI'm [Your Name], a [Year] [Department] student at NIT Jamshedpur...\n\nI came across your profile and I'm very interested in the ${target.role} role at ${target.company}. I've been working on [projects/skills]...\n\nWould you be willing to refer me or share any guidance?`}
              value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-primary${loading ? ' btn-loading' : ''}`} disabled={!message.trim() || loading}>
              {loading ? 'Sending…' : 'Send Request ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────────────────────
function OpportunityCard({ op, onRequest }) {
  const tc = getTypeColor(op.type);
  const deadline = op.deadline ? new Date(op.deadline) : null;
  const isExpired = deadline && deadline < new Date();
  const daysLeft = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="card" style={{
      borderLeft: `3px solid ${tc.text}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Left Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Type badge */}
          <div style={{ marginBottom: '0.625rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: '20px', background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>{op.type}</span>
          </div>

          {/* Role & Company — prominently displayed */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {op.role}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0 0.375rem' }}>at</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
              {op.company}
            </span>
          </div>

          {/* Posted By */}
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Posted by </span>
            <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{op.postedByName}</span>
            {op.postedByCompany && op.postedByCompany !== op.company && (
              <span style={{ color: 'var(--text-muted)' }}> · Works at {op.postedByCompany}</span>
            )}
          </div>

          {/* Description */}
          {op.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {op.description}
            </p>
          )}

          {/* Skills */}
          {op.skillsRequired?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem' }}>
              {op.skillsRequired.map(s => <span key={s} className="tag" style={{ fontSize: '0.75rem' }}>{s}</span>)}
            </div>
          )}
        </div>

        {/* Right — Deadline & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
          {deadline && (
            <div style={{
              textAlign: 'right',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: isExpired ? 'rgba(239,68,68,0.1)' : daysLeft <= 3 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isExpired ? 'rgba(239,68,68,0.25)' : daysLeft <= 3 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEADLINE</div>
              <div style={{
                fontSize: '0.8125rem', fontWeight: 700,
                color: isExpired ? '#f87171' : daysLeft <= 3 ? '#fbbf24' : 'var(--text-secondary)',
              }}>
                {isExpired ? 'Expired' : `${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${daysLeft}d left`}
              </div>
            </div>
          )}

          {op.referralLink && (
            <a href={op.referralLink} target="_blank" rel="noreferrer"
              className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}
              onClick={e => e.stopPropagation()}>
              🔗 Job Link
            </a>
          )}

          {op.hasReferralOption !== false ? (
            <button className="btn btn-primary btn-sm"
              style={{ opacity: isExpired ? 0.5 : 1 }}
              onClick={() => !isExpired && onRequest(op)}
              disabled={isExpired}>
              {isExpired ? 'Expired' : 'Request Referral ✨'}
            </button>
          ) : (
            <span style={{
              fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600,
              background: 'rgba(255,255,255,0.03)', padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)',
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
            }}>
              📢 Direct Apply Only
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Alumni Directory Card ────────────────────────────────────────────────────
function AlumniCard({ alum, onViewProfile, onGetReferral, onConnect, isAlumni }) {
  const pts = alum.contributionPoints || 0;
  const tierColor = pts >= 100 ? '#fbbf24' : pts >= 50 ? '#a5b4fc' : '#34d399';
  const tierLabel = pts >= 100 ? 'Top Contributor' : pts >= 50 ? 'Active Mentor' : 'Contributor';

  return (
    <div className="card" style={{ transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Avatar + Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px', cursor: 'pointer' }}
          onClick={() => onViewProfile(alum)}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: getGrad(alum.name), flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: '1.125rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            {(alum.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.125rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{alum.name}</span>
              {alum.isVerified && <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '20px' }}>✓ Verified</span>}
              {pts > 0 && <span style={{ fontSize: '0.65rem', color: tierColor, fontWeight: 700 }}>• {tierLabel}</span>}
            </div>
            {/* Role & Company Highlighted */}
            {(alum.designation || alum.company) && (
              <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {alum.designation && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alum.designation}</span>}
                {alum.designation && alum.company && <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>@</span>}
                {alum.company && <span style={{ fontWeight: 700, color: '#fbbf24' }}>{alum.company}</span>}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {alum.department} · Class of {alum.graduationYear}
            </div>
            {alum.skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
                {alum.skills.slice(0, 5).map(s => <span key={s} className="tag" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{s}</span>)}
                {alum.skills.length > 5 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{alum.skills.length - 5}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onViewProfile(alum)} style={{ fontSize: '0.75rem' }}>
            View Profile
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onConnect(alum)} style={{ fontSize: '0.75rem' }}>
            💬 Connect
          </button>
          {!isAlumni && (
            <button className="btn btn-primary btn-sm" onClick={() => onGetReferral(alum)} style={{ fontSize: '0.75rem' }}>
              Get Referral
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
function Leaderboard({ leaderboard }) {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800 }}>🏆 Alumni Contribution Leaderboard</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Alumni earn points for posting referral opportunities (+15 pts) and successfully approving referral requests (+30 pts).
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No activity yet — be the first to contribute!</div>
        ) : leaderboard.map((a, i) => {
          const pts = a.contributionPoints || 0;
          const isMedal = i < 3;
          return (
            <div key={a.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem',
              background: isMedal ? 'rgba(255,255,255,0.03)' : 'var(--bg-card)',
              border: isMedal ? `1px solid rgba(${i === 0 ? '251,191,36' : i === 1 ? '148,163,184' : '217,119,6'},0.3)` : 'var(--border-default)',
            }}>
              <div style={{ width: 32, textAlign: 'center', fontSize: isMedal ? '1.25rem' : '0.9375rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                {getMedalEmoji(i)}
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: getGrad(a.name), flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white',
              }}>
                {(a.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{a.name}</div>
                {(a.designation || a.company) && (
                  <div style={{ fontSize: '0.8rem' }}>
                    {a.designation && <span style={{ color: 'var(--text-secondary)' }}>{a.designation}</span>}
                    {a.designation && a.company && <span style={{ color: 'var(--text-muted)' }}> @ </span>}
                    {a.company && <span style={{ color: '#fbbf24', fontWeight: 600 }}>{a.company}</span>}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 900, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : 'var(--text-secondary)' }}>
                  {pts}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ReferralPortal ──────────────────────────────────────────────────────
export default function ReferralPortal({ user, isAlumni }) {
  const [activeTab, setActiveTab] = useState(isAlumni ? 'manage' : 'browse');
  const [opportunities, setOpportunities] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [oppForm, setOppForm] = useState({
    role: '', company: '', type: 'Referral Opportunity',
    description: '', skillsRequired: '', deadline: '', referralLink: '',
    hasReferralOption: true,
  });

  // Modal states
  const [selectedAlumni, setSelectedAlumni] = useState(null); // For profile modal
  const [requestTarget, setRequestTarget] = useState(null);   // For referral request modal

  const [searchQ, setSearchQ] = useState('');
  const [searchDept, setSearchDept] = useState('');

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      if (activeTab === 'browse' || activeTab === 'manage') {
        const ops = await api.get('/alumni/opportunities');
        let myReqs = [];
        if (!isAlumni) {
          try {
            myReqs = await api.get('/alumni/referral-requests/my');
          } catch (e) {}
        }
        const requestedOppIds = new Set((myReqs || []).map(r => r.opportunity?.toString()).filter(Boolean));
        const filteredOps = (ops || []).filter(op => !requestedOppIds.has(op._id?.toString()));
        setOpportunities(filteredOps);
      }
      if (activeTab === 'directory') {
        const alums = await api.get('/alumni/search');
        setAlumniList(Array.isArray(alums) ? alums : []);
      }
      if (activeTab === 'requests') {
        const endpoint = isAlumni ? '/alumni/referral-requests/incoming' : '/alumni/referral-requests/my';
        const reqs = await api.get(endpoint);
        setRequests(Array.isArray(reqs) ? reqs : []);
      }
      if (activeTab === 'leaderboard') {
        const lb = await api.get('/alumni/leaderboard');
        setLeaderboard(Array.isArray(lb) ? lb : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQ) params.append('q', searchQ);
      if (searchDept) params.append('department', searchDept);
      const alums = await api.get(`/alumni/search?${params}`);
      setAlumniList(Array.isArray(alums) ? alums : []);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handlePostOpportunity = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const skillsArray = oppForm.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/alumni/opportunity', { ...oppForm, skillsRequired: skillsArray });
      setSuccess('✓ Opportunity posted! You earned +15 contribution points.');
      setOppForm({ role: '', company: '', type: 'Referral Opportunity', description: '', skillsRequired: '', deadline: '', referralLink: '', hasReferralOption: true });
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleSendRequest = async (message) => {
    setError(''); setSuccess('');
    try {
      await api.post('/alumni/referral-request', {
        alumniId: requestTarget.postedBy || requestTarget.id,
        opportunityId: requestTarget._id || null,
        message,
      });
      setSuccess('✓ Referral request sent! The alumni will be notified.');
      setRequestTarget(null);
      setActiveTab('requests');
    } catch (err) {
      setError(err.message || 'Failed to send request. Please try again.');
    }
  };

  const handleRespond = async (requestId, status) => {
    setError('');
    try {
      await api.post(`/alumni/referral-request/${requestId}/respond`, { status });
      if (status === 'accepted') setSuccess('✓ Referral approved! +30 contribution points awarded.');
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const openAlumniProfile = async (alum) => {
    // Fetch full profile if we only have partial info
    try {
      const full = await api.get(`/alumni/profile/${alum.id}`);
      setSelectedAlumni({ ...alum, ...full });
    } catch {
      setSelectedAlumni(alum);
    }
  };

  const TABS = [
    ...(isAlumni ? [{ id: 'manage', label: '➕ Post Opportunity' }] : [{ id: 'browse', label: '💼 Opportunities' }]),
    { id: 'directory', label: '🔍 Alumni Directory' },
    { id: 'requests', label: `✉ Requests${requests.filter(r => r.status === 'pending').length > 0 ? ` (${requests.filter(r => r.status === 'pending').length})` : ''}` },
    { id: 'leaderboard', label: '🏆 Leaderboard' },
  ];

  const [connectTarget, setConnectTarget] = useState(null);

  return (
    <div className="referral-portal">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>Referral & Connection Network</h2>
        <p className="page-subtitle">Bridge the gap between NIT JSR students and verified alumni</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          ⚠ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(n => <div key={n} className="card"><div className="skeleton" style={{ height: '80px' }} /></div>)}
        </div>
      ) : (
        <>
          {/* ── BROWSE OPPORTUNITIES ── */}
          {activeTab === 'browse' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opportunities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
                  No referral opportunities posted yet.<br />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Check the Alumni Directory to reach out directly to alumni.</span>
                </div>
              ) : (
                opportunities.map(op => (
                  <OpportunityCard key={op._id} op={op}
                    onRequest={(op) => setRequestTarget({ ...op, id: op.postedBy, name: op.postedByName, company: op.company })}
                  />
                ))
              )}
            </div>
          )}

          {/* ── POST OPPORTUNITY (ALUMNI) ── */}
          {activeTab === 'manage' && (
            <div className="card">
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Share a Referral Opportunity with Students</div>
              <form onSubmit={handlePostOpportunity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Target Role *</label>
                    <input className="input" required placeholder="e.g. Software Engineer, PM" value={oppForm.role} onChange={e => setOppForm({ ...oppForm, role: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Company *</label>
                    <input className="input" required placeholder="e.g. Google, Juspay" value={oppForm.company} onChange={e => setOppForm({ ...oppForm, company: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Opportunity Type</label>
                    <select className="input" value={oppForm.type} onChange={e => setOppForm({ ...oppForm, type: e.target.value })}>
                      <option value="Referral Opportunity">Referral Opportunity</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-Time">Full-Time</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Application Deadline *</label>
                    <input className="input" type="date" required value={oppForm.deadline} onChange={e => setOppForm({ ...oppForm, deadline: e.target.value })} />
                  </div>
                  <div className="field" style={{ gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input type="checkbox" id="hasReferralOption" checked={oppForm.hasReferralOption} 
                      onChange={e => setOppForm({ ...oppForm, hasReferralOption: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label htmlFor="hasReferralOption" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Active Referral Support (Students can request referral from you for this position)
                    </label>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Job / Application Link *</label>
                  <input className="input" required placeholder="https://careers.company.com/..." value={oppForm.referralLink} onChange={e => setOppForm({ ...oppForm, referralLink: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Required Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                  <input className="input" placeholder="e.g. React, Java, Docker, System Design" value={oppForm.skillsRequired} onChange={e => setOppForm({ ...oppForm, skillsRequired: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Description / Eligibility</label>
                  <textarea className="textarea" rows={4} placeholder="Describe the role, team, expectations and any specific eligibility criteria..." value={oppForm.description} onChange={e => setOppForm({ ...oppForm, description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Post to Network</button>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>🎯 Earn +15 contribution points for posting</div>
                </div>
              </form>

              {/* Alumni's posted opportunities */}
              {opportunities.filter(op => op.postedBy?.toString() === user?.id?.toString()).length > 0 && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Your Posted Opportunities</div>
                  {opportunities.filter(op => op.postedBy?.toString() === user?.id?.toString()).map(op => (
                    <div key={op._id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{op.role}</span>
                        <span style={{ color: 'var(--text-muted)', margin: '0 0.375rem' }}>at</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{op.company}</span>
                        <span className="badge badge-default" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>{op.type}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {op.deadline ? new Date(op.deadline).toLocaleDateString('en-IN') : 'No deadline'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ALUMNI DIRECTORY ── */}
          {activeTab === 'directory' && (
            <div>
              <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="input" placeholder="Search by name, company, skill..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ flex: 1, minWidth: '200px' }} />
                <input className="input" placeholder="Department (e.g. CSE, EE)"
                  value={searchDept} onChange={e => setSearchDept(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ width: '200px' }} />
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
              </div>

              {alumniList.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎓</div>
                  No alumni found matching your search.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {alumniList.map(alum => (
                    <AlumniCard key={alum.id} alum={alum} isAlumni={isAlumni}
                      onViewProfile={openAlumniProfile}
                      onGetReferral={(a) => setRequestTarget({ id: a.id, role: 'General Referral', company: a.company || 'their company', name: a.name })}
                      onConnect={(a) => setConnectTarget({ id: a.id?.toString(), name: a.name, designation: a.designation, company: a.company })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REFERRAL REQUESTS ── */}
          {activeTab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {requests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{isAlumni ? '📭' : '📤'}</div>
                  {isAlumni ? 'No incoming referral requests yet.' : 'You haven\'t sent any referral requests yet.'}
                  {!isAlumni && (
                    <div style={{ marginTop: '1rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('browse')}>
                        Browse Opportunities →
                      </button>
                    </div>
                  )}
                </div>
              ) : requests.map(req => (
                <div key={req._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {isAlumni ? `📩 From ${req.studentName}` : `📤 To ${req.alumniName}`}
                      </div>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>For: </span>
                        <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{req.opportunityTitle}</span>
                      </div>
                      {isAlumni && req.studentDepartment && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                          Dept: {req.studentDepartment}
                          {req.studentSkills?.length > 0 && ` · Skills: ${req.studentSkills.slice(0, 3).join(', ')}`}
                        </div>
                      )}
                    </div>
                    <span className={`badge badge-${req.status === 'pending' ? 'amber' : req.status === 'accepted' ? 'green' : 'red'}`}>
                      {req.status}
                    </span>
                  </div>

                  {req.message && (
                    <div style={{
                      fontSize: '0.875rem', color: 'var(--text-secondary)',
                      padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                      lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap',
                    }}>
                      {req.message}
                    </div>
                  )}

                  {isAlumni && req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRespond(req._id, 'accepted')}>
                        ✓ Approve Referral (+30 pts)
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRespond(req._id, 'declined')}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {activeTab === 'leaderboard' && <Leaderboard leaderboard={leaderboard} />}
        </>
      )}

      {/* Alumni Profile Modal */}
      {selectedAlumni && (
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
          isAlumni={isAlumni}
          onGetReferral={(a) => {
            setRequestTarget({ id: a.id, role: 'General Referral', company: a.company || 'their company', name: a.name });
          }}
          onConnect={(a) => setConnectTarget({ id: a.id?.toString(), name: a.name, designation: a.designation, company: a.company })}
        />
      )}

      {/* Referral Request Modal */}
      {requestTarget && (
        <RequestModal
          target={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSubmit={handleSendRequest}
        />
      )}

      {/* Connect Modal for messages */}
      {connectTarget && (
        <ConnectModal
          recipient={connectTarget}
          onClose={() => setConnectTarget(null)}
        />
      )}
    </div>
  );
}
