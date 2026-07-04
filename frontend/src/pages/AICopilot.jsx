import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

// ─── Chat Message ────────────────────────────────────────────────────────────
function Message({ role, text }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: role === 'user' ? 'row-reverse' : 'row',
      gap: '0.625rem',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    }} className="fade-in">
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: role === 'user'
          ? 'linear-gradient(135deg, var(--primary), var(--accent-violet))'
          : 'linear-gradient(135deg, var(--accent-cyan), #0891b2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        {role === 'user' ? '👤' : '🤖'}
      </div>
      <div className={`chat-bubble chat-bubble-${role === 'user' ? 'user' : 'ai'}`}
        style={{ maxWidth: '80%' }}>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{text}</div>
      </div>
    </div>
  );
}

// ─── Roadmap Tab ─────────────────────────────────────────────────────────────
function RoadmapTab({ user }) {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError('');
    setRoadmap(null);
    try {
      const data = await api.post('/ai/roadmap', {
        targetRole,
        currentSkills: user?.skills || [],
      });
      setRoadmap(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const phaseColors = ['var(--primary)', 'var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-emerald)', 'var(--accent-amber)'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input className="input" placeholder="Target role (e.g. Full Stack Engineer, Data Scientist)"
          value={targetRole} onChange={e => setTargetRole(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()} id="roadmap-role-input"
          style={{ flex: 1 }} />
        <button className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
          onClick={generate} disabled={!targetRole.trim() || loading} id="gen-roadmap-btn">
          {loading ? 'Generating…' : '🗺 Build Roadmap'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {roadmap && (
        <div className="fade-in">
          {/* Header */}
          <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(167,139,250,0.08))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.25rem' }}>{roadmap.targetRole}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>⏱ Estimated: {roadmap.estimatedTime}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {roadmap.salaryRange && <div className="badge badge-green" style={{ marginBottom: '0.375rem', display: 'block' }}>{roadmap.salaryRange}</div>}
                {roadmap.topCompanies?.slice(0, 3).map(c => (
                  <span key={c} className="badge badge-default" style={{ marginRight: '0.25rem' }}>{c}</span>
                ))}
              </div>
            </div>

            {roadmap.skillGaps?.length > 0 && (
              <div style={{ marginTop: '0.875rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Skill Gaps to Close</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {roadmap.skillGaps.map(s => <span key={s} className="badge badge-amber">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Phases */}
          {roadmap.phases?.map((phase, i) => (
            <div key={i} className="card" style={{ marginBottom: '0.75rem', borderLeft: `3px solid ${phaseColors[i % phaseColors.length]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: phaseColors[i % phaseColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {phase.phase}
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{phase.title}</div>
                </div>
                <span className="badge badge-default">{phase.duration}</span>
              </div>

              <div style={{ marginBottom: '0.625rem', marginLeft: '2.375rem' }}>
                {phase.goals?.map((g, j) => (
                  <div key={j} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>→ {g}</div>
                ))}
              </div>

              {phase.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem', marginLeft: '2.375rem' }}>
                  {phase.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              )}

              {phase.resources?.length > 0 && (
                <div style={{ marginLeft: '2.375rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Resources</div>
                  {phase.resources.map((r, j) => (
                    <div key={j} style={{ fontSize: '0.8125rem', color: 'var(--primary-light)', marginBottom: '0.125rem' }}>
                      📚 {r.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({r.type})</span>
                    </div>
                  ))}
                </div>
              )}

              {phase.milestone && (
                <div style={{
                  marginTop: '0.625rem', padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: `rgba(${i % 2 === 0 ? '99,102,241' : '34,211,238'},0.08)`,
                  border: `1px solid rgba(${i % 2 === 0 ? '99,102,241' : '34,211,238'},0.15)`,
                  marginLeft: '2.375rem',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    🏁 <strong style={{ color: 'var(--text-primary)' }}>Milestone:</strong> {phase.milestone}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Referral Message Tab ────────────────────────────────────────────────────
function ReferralTab({ user }) {
  const [alumnus, setAlumnus] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [copied, setCopied] = useState(false);

  const message = alumnus && company && role
    ? `Hi ${alumnus},\n\nI hope you're doing well! I'm ${user?.name || 'a student'} from NIT Jamshedpur (${user?.department || 'Engineering'}, Class of ${user?.graduationYear || '—'}).\n\nI recently came across your profile and noticed you're at ${company}. I'm very interested in the ${role} role at ${company} and would truly appreciate your guidance, or if possible, a referral.\n\nI've been working on [relevant projects/skills], and I believe my background aligns well with what ${company} looks for. I'd be happy to share my resume and chat at a time convenient for you.\n\nThank you so much for your time and for being a part of our alumni community!\n\nBest regards,\n${user?.name || 'Your Name'}\n${user?.department || ''} | NIT Jamshedpur`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Generate a personalized, professional referral request message to send to an alumnus.
      </p>
      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div className="field">
          <label className="label">Alumnus Name</label>
          <input className="input" placeholder="e.g. Ravi Kumar" value={alumnus}
            onChange={e => setAlumnus(e.target.value)} id="ref-alumnus" />
        </div>
        <div className="field">
          <label className="label">Company</label>
          <input className="input" placeholder="e.g. Google" value={company}
            onChange={e => setCompany(e.target.value)} id="ref-company" />
        </div>
        <div className="field">
          <label className="label">Target Role</label>
          <input className="input" placeholder="e.g. SDE-2" value={role}
            onChange={e => setRole(e.target.value)} id="ref-role" />
        </div>
      </div>

      {message && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button className={`btn btn-outline btn-sm badge-${copied ? 'green' : 'default'}`} onClick={copy}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7,
            whiteSpace: 'pre-wrap', fontFamily: 'inherit',
          }}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Copilot Chat Tab ────────────────────────────────────────────────────────
function CopilotTab({ user }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Career Assistant powered by Groq. I can help with:\n\n• Resume writing & optimization\n• Interview preparation tips\n• Career path guidance\n• Job search strategies\n• Skill development roadmaps\n\nWhat would you like to work on today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const data = await api.post('/ai/copilot', {
        message: userMsg,
        context: {
          name: user?.name,
          department: user?.department,
          graduationYear: user?.graduationYear,
          skills: user?.skills,
          role: user?.role,
        },
      });
      setMessages(m => [...m, { role: 'ai', text: data.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', text: `Sorry, I ran into an error: ${e.message}. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How do I write a strong resume for a software engineering role?',
    'What should I include in my project section?',
    'How do I prepare for FAANG interviews?',
    'What skills should I develop for data science?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0', scrollbarWidth: 'thin' }}>
        {messages.map((m, i) => <Message key={i} role={m.role} text={m.text} />)}
        {loading && (
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.875rem 1rem' }}>
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', animationDelay: '0.15s' }} />
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {suggestions.map((s, i) => (
            <button key={i} className="btn btn-ghost btn-sm"
              style={{ border: '1px solid var(--border-default)', fontSize: '0.8rem', textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '0.375rem 0.625rem' }}
              onClick={() => { setInput(s); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
        <input className="input" placeholder="Ask anything about your career…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          id="copilot-input" style={{ flex: 1 }} />
        <button className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
          onClick={send} disabled={!input.trim() || loading} id="copilot-send">
          {loading ? '' : '→'}
        </button>
      </div>
    </div>
  );
}

// ─── Main AICopilot Component ─────────────────────────────────────────────────
export default function AICopilot({ user }) {
  const [tab, setTab] = useState('copilot');

  const tabs = [
    { id: 'copilot', label: '🤖 AI Copilot', desc: 'Chat with your AI career assistant' },
    { id: 'roadmap', label: '🗺 Career Roadmap', desc: 'Get a personalized learning path' },
    { id: 'referral', label: '✉ Referral Message', desc: 'Generate outreach messages' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
          <h2 className="page-title">AI Career Assistant</h2>
          <div className="ai-badge">Powered by Groq</div>
        </div>
        <p className="page-subtitle">Personalized roadmaps, outreach assistance, and job hunt coaching powered by AI.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            id={`ai-tab-${t.id}`}
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${tab === t.id ? 'var(--primary)' : 'var(--border-default)'}`,
              background: tab === t.id ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              boxShadow: tab === t.id ? '0 0 0 1px var(--primary), 0 0 16px var(--primary-glow)' : 'none',
            }}>
            <div style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{t.label.split(' ')[0]}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {t.label.slice(t.label.indexOf(' ') + 1)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'copilot' && <CopilotTab user={user} />}
        {tab === 'roadmap' && <RoadmapTab user={user} />}
        {tab === 'referral' && <ReferralTab user={user} />}
      </div>
    </div>
  );
}
