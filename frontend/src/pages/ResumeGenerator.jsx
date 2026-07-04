import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => `_${Math.random().toString(36).slice(2, 9)}`;

const defaultResume = () => ({
  personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', location: '' },
  summary: '',
  targetRole: '',
  targetCompany: '',
  skills: { technical: [], databases: [], soft: [], tools: [], languages: [] },
  education: [],
  experience: [],
  projects: [],
  achievements: [],
  certifications: [],
  extracurriculars: [],
});

// ─── Subcomponents ──────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder, colorClass = '' }) {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setVal('');
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {tags.map(t => (
          <span key={t} className={`tag ${colorClass}`}>
            {t}
            <button className="tag-remove" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input className="input input-sm" placeholder={placeholder || 'Add and press Enter'}
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button className="btn btn-outline btn-sm" onClick={add} type="button">Add</button>
      </div>
    </div>
  );
}

function SectionWrapper({ icon, title, children, collapsible = true }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div
        className="collapsible-header"
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ cursor: collapsible ? 'pointer' : 'default', padding: '0.875rem 1rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.125rem' }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</span>
        </div>
        {collapsible && <span className={`collapsible-icon ${open ? 'open' : ''}`}>▾</span>}
      </div>
      {(!collapsible || open) && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border-subtle)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function AIButton({ onClick, loading, label = 'AI Assist ✨', small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`btn btn-sm${loading ? ' btn-loading' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(99,102,241,0.2))',
        border: '1px solid rgba(167,139,250,0.3)',
        color: 'var(--accent-violet)',
        fontWeight: 600,
        fontSize: small ? '0.75rem' : '0.8rem',
      }}
    >
      {!loading && '✨'} {loading ? 'Generating…' : label}
    </button>
  );
}

// ─── ATS Score Panel ─────────────────────────────────────────────────────────

function ATSPanel({ score, result }) {
  if (!result) return null;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#fb7185';
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="fade-in" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
        {/* Ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="104" height="104">
            <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="52" cy="52" r={r} fill="none" stroke={color}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '52px 52px', transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.625rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>ATS Score</span>
            <span className={`badge badge-${score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'}`}>Grade {result.grade}</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '340px' }}>{result.summary}</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
        {/* Strengths */}
        {result.strengths?.length > 0 && (
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#34d399', marginBottom: '0.5rem' }}>✓ Strengths</div>
            {result.strengths.map((s, i) => <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {s}</div>)}
          </div>
        )}
        {/* Issues */}
        {result.improvements?.length > 0 && (
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#fb7185', marginBottom: '0.5rem' }}>⚡ Fix These</div>
            {result.improvements.slice(0, 3).map((imp, i) => (
              <div key={i} style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{imp.section}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{imp.fix}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing keywords */}
      {result.missingKeywords?.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Missing Keywords</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {result.missingKeywords.map(k => <span key={k} className="badge badge-amber">{k}</span>)}
          </div>
        </div>
      )}

      {/* Action items */}
      {result.actionItems?.length > 0 && (
        <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>📋 Action Items</div>
          {result.actionItems.map((a, i) => (
            <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {i + 1}. {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Resume Preview ──────────────────────────────────────────────────────────

function ResumePreview({ data }) {
  const { personalInfo: pi, summary, skills, education, experience, projects, achievements, certifications } = data;

  return (
    <div className="resume-preview">
      {/* Header */}
      <div style={{ marginBottom: '6px' }}>
        <h1>{pi.name || 'Your Name'}</h1>
        <div className="contact-line">
          {pi.email && <span>✉ {pi.email}</span>}
          {pi.phone && <span>📞 {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>🔗 {pi.linkedin.replace('https://linkedin.com/in/', 'LinkedIn/')}</span>}
          {pi.github && <span>⌥ {pi.github.replace('https://github.com/', 'GitHub/')}</span>}
          {pi.portfolio && <span>🌐 {pi.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <>
          <h2>Professional Summary</h2>
          <p>{summary}</p>
        </>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.databases?.length > 0 || skills.tools?.length > 0 || skills.languages?.length > 0) && (
        <>
          <h2>Technical Skills</h2>
          {skills.technical?.length > 0 && <p><strong>Programming & CS:</strong> {skills.technical.join(' • ')}</p>}
          {skills.databases?.length > 0 && <p><strong>Databases:</strong> {skills.databases.join(' • ')}</p>}
          {skills.tools?.length > 0 && <p><strong>Tools & Frameworks:</strong> {skills.tools.join(' • ')}</p>}
          {skills.languages?.length > 0 && <p><strong>Languages:</strong> {skills.languages.join(' • ')}</p>}
          {skills.soft?.length > 0 && <p><strong>Soft Skills:</strong> {skills.soft.join(' • ')}</p>}
        </>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <>
          <h2>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div className="entry-header">
                <div>
                  <h3>{e.institution}</h3>
                  <p>{e.degree}{e.branch ? ` — ${e.branch}` : ''}{e.cgpa ? ` | CGPA/Score: ${e.cgpa}` : ''}</p>
                </div>
                <div className="entry-meta">{e.startYear && `${e.startYear} — `}{e.endYear || 'Present'}</div>
              </div>
              {e.relevantCourses?.length > 0 && (
                <p style={{ fontSize: '9.5pt', color: '#6b7280', marginTop: '2px' }}>
                  <em>Relevant Courses: {e.relevantCourses.join(', ')}</em>
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <>
          <h2>Experience</h2>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div className="entry-header">
                <div>
                  <h3>{e.role}</h3>
                  <p style={{ color: '#4338ca', fontWeight: 600, fontSize: '10pt' }}>{e.company}{e.location ? ` — ${e.location}` : ''}</p>
                </div>
                <div className="entry-meta">{e.startDate}{e.endDate ? ` — ${e.isCurrentRole ? 'Present' : e.endDate}` : ''}</div>
              </div>
              {e.points?.length > 0 && (
                <ul style={{ marginTop: '3px' }}>
                  {e.points.filter(p => p.trim()).map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              )}
              {e.techUsed?.length > 0 && (
                <div className="tech-tags" style={{ marginTop: '4px' }}>
                  {e.techUsed.map(t => <span key={t} className="tech-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <>
          <h2>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div className="entry-header">
                <div>
                  <h3>{p.name}{p.githubLink && <span style={{ fontSize: '8.5pt', fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>{p.githubLink}</span>}</h3>
                </div>
                <div className="entry-meta">{p.startDate}{p.endDate ? ` — ${p.endDate}` : ''}</div>
              </div>
              {p.techStack?.length > 0 && (
                <div className="tech-tags">
                  {p.techStack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                </div>
              )}
              {p.points?.length > 0 && (
                <ul style={{ marginTop: '3px' }}>
                  {p.points.filter(pt => pt.trim()).map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <>
          <h2>Achievements & Awards</h2>
          {achievements.map((a, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div className="entry-header">
                <h3>{a.title}</h3>
                <div className="entry-meta">{a.year}</div>
              </div>
              {a.description && <p style={{ fontSize: '9.5pt', color: '#374151' }}>{a.description}</p>}
              {a.organization && <p style={{ fontSize: '9pt', color: '#9ca3af' }}>{a.organization}</p>}
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <>
          <h2>Certifications</h2>
          {certifications.map((c, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div className="entry-header">
                <div>
                  <h3>{c.name}</h3>
                  <p style={{ fontSize: '9.5pt', color: '#6b7280' }}>{c.issuer}</p>
                </div>
                <div className="entry-meta">{c.year}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResumeGenerator({ user, setUser }) {
  const [resume, setResume] = useState(defaultResume());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [atsChecking, setAtsChecking] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [aiLoading, setAiLoading] = useState({});
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [atsResumeSource, setAtsResumeSource] = useState('current'); // 'current' | 'upload' | 'paste'
  const [uploadedResumeText, setUploadedResumeText] = useState('');
  const fileInputRef = useRef(null);
  const printRef = useRef(null);

  const extractTextFromPdf = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromDocx = async (arrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          let text = '';
          if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            text = await extractTextFromPdf(arrayBuffer);
          } else if (file.name.endsWith('.docx')) {
            text = await extractTextFromDocx(arrayBuffer);
          } else {
            throw new Error('Unsupported file. Please upload PDF or DOCX.');
          }
          if (!text.trim()) throw new Error('Could not extract readable text.');
          setUploadedResumeText(text);
        } catch (err) {
          setError(err.message || 'Error parsing document.');
        } finally {
          setParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('File reading failed.');
      setParsing(false);
    }
  };

  // Fetch saved resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const data = await api.get('/resume');
        if (data && data._id) {
          // Merge with defaults to prevent missing fields
          setResume(r => ({
            ...defaultResume(),
            ...data,
            personalInfo: { ...defaultResume().personalInfo, ...data.personalInfo },
            skills: { ...defaultResume().skills, ...data.skills },
          }));
          // Pre-fill personal info from user profile
          if (!data.personalInfo?.name && user?.name) {
            setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, name: user.name, email: user.email || '' } }));
          }
        }
      } catch (e) {
        // No resume yet — pre-fill from user
        if (user) {
          setResume(r => ({
            ...r,
            personalInfo: { ...r.personalInfo, name: user.name || '', email: user.email || '' },
            targetRole: '',
          }));
        }
      }
    };
    fetchResume();
  }, [user]);

  const update = useCallback((path, value) => {
    setResume(r => {
      const parts = path.split('.');
      const clone = { ...r };
      let obj = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = Array.isArray(obj[parts[i]]) ? [...obj[parts[i]]] : { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return clone;
    });
    setSaved(false);
  }, []);

  const updatePI = (field, val) => update(`personalInfo.${field}`, val);
  const updateSkills = (cat, tags) => update(`skills.${cat}`, tags);

  // Entry management helpers
  const addEntry = (section, template) => {
    update(section, [...(resume[section] || []), { ...template, _id: uid() }]);
  };
  const updateEntry = (section, idx, field, val) => {
    const arr = [...(resume[section] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    update(section, arr);
  };
  const removeEntry = (section, idx) => {
    const arr = [...(resume[section] || [])];
    arr.splice(idx, 1);
    update(section, arr);
  };

  const saveResume = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/resume', resume);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const checkATS = async () => {
    setAtsChecking(true);
    setAtsResult(null);
    setError('');
    try {
      let text = '';
      if (atsResumeSource === 'current') {
        text = buildResumeText(resume);
      } else if (atsResumeSource === 'upload' || atsResumeSource === 'paste') {
        text = uploadedResumeText.trim();
        if (!text) throw new Error('Please provide resume text or upload a file first.');
      }
      const result = await api.post('/resume/check-ats', { resumeText: text, jobDescription: jobDesc });
      setAtsResult(result);
      if (result.atsScore) {
        setResume(prev => ({ ...prev, lastAtsScore: result.atsScore }));
        if (typeof setUser === 'function') {
          setUser(prev => ({ ...prev, lastAtsScore: result.atsScore }));
        }
      }
    } catch (e) {
      setError('ATS check failed: ' + e.message);
    } finally {
      setAtsChecking(false);
    }
  };

  const buildResumeText = (r) => {
    const pi = r.personalInfo;
    let text = `${pi.name}\n${pi.email} | ${pi.phone} | ${pi.location}\n\n`;
    if (r.summary) text += `SUMMARY\n${r.summary}\n\n`;
    text += `SKILLS\n${Object.values(r.skills || {}).flat().join(', ')}\n\n`;
    r.education?.forEach(e => { text += `EDUCATION\n${e.institution} — ${e.degree} ${e.branch} CGPA:${e.cgpa}\n`; });
    r.experience?.forEach(e => { text += `\nEXPERIENCE\n${e.role} at ${e.company}\n${e.points?.join('\n')}\n`; });
    r.projects?.forEach(p => { text += `\nPROJECT: ${p.name}\n${p.points?.join('\n')}\nTech: ${p.techStack?.join(', ')}\n`; });
    r.achievements?.forEach(a => { text += `\nACHIEVEMENT: ${a.title} — ${a.description}\n`; });
    r.certifications?.forEach(c => { text += `\nCERTIFICATION: ${c.name} by ${c.issuer}\n`; });
    return text;
  };

  const aiAssist = async (key, endpoint, payload) => {
    setAiLoading(l => ({ ...l, [key]: true }));
    try {
      const result = await api.post(endpoint, payload);
      return result;
    } catch (e) {
      setError('AI assist failed: ' + e.message);
      return null;
    } finally {
      setAiLoading(l => ({ ...l, [key]: false }));
    }
  };

  const generateSummary = async () => {
    const res = await aiAssist('summary', '/resume/generate-summary', {
      name: resume.personalInfo.name,
      targetRole: resume.targetRole,
      targetCompany: resume.targetCompany,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
    });
    if (res?.summary) update('summary', res.summary);
  };

  const polishBullets = async (section, idx, points) => {
    const key = `${section}-${idx}`;
    const res = await aiAssist(key, '/resume/polish-section', {
      section,
      content: points.join('\n'),
      targetRole: resume.targetRole,
    });
    if (res?.improved) {
      const improved = res.improved.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''));
      updateEntry(section, idx, 'points', improved);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'builder', label: '✏️ Builder' },
    { id: 'preview', label: '👁 Preview' },
    { id: 'ats', label: '🎯 ATS Check' },
  ];

  return (
    <div className="fade-in">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Resume Builder</h2>
          <p className="page-subtitle">Build an ATS-friendly engineering resume with AI assistance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saved && <span className="badge badge-green">✓ Saved</span>}
          {resume.lastAtsScore && <span className="badge badge-blue">ATS: {resume.lastAtsScore}</span>}
          <button className={`btn btn-outline btn-sm${saving ? ' btn-loading' : ''}`}
            onClick={saveResume} disabled={saving} id="save-resume">
            {saving ? 'Saving…' : '💾 Save'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint} id="print-resume">
            🖨 Export PDF
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {error} <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button></div>}

      {/* Tab bar */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)} id={`resume-tab-${t.id}`}>{t.label}</button>
        ))}
      </div>

      {/* ── BUILDER TAB ── */}
      {activeTab === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Form */}
          <div>
            {/* Target */}
            <SectionWrapper icon="🎯" title="Target Position">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div className="field">
                  <label className="label">Target Role</label>
                  <input className="input" placeholder="e.g. Software Engineer" value={resume.targetRole}
                    onChange={e => update('targetRole', e.target.value)} id="target-role" />
                </div>
                <div className="field">
                  <label className="label">Target Company</label>
                  <input className="input" placeholder="e.g. Google, Microsoft" value={resume.targetCompany}
                    onChange={e => update('targetCompany', e.target.value)} id="target-company" />
                </div>
              </div>
            </SectionWrapper>

            {/* Personal Info */}
            <SectionWrapper icon="👤" title="Personal Information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginTop: '0.75rem' }}>
                {[
                  { key: 'name', label: 'Full Name', ph: 'Raunak Srivastava' },
                  { key: 'email', label: 'Email', ph: 'name@nitjsr.ac.in' },
                  { key: 'phone', label: 'Phone', ph: '+91 98765 43210' },
                  { key: 'location', label: 'Location', ph: 'Jamshedpur, India' },
                  { key: 'linkedin', label: 'LinkedIn URL', ph: 'linkedin.com/in/username' },
                  { key: 'github', label: 'GitHub URL', ph: 'github.com/username' },
                  { key: 'portfolio', label: 'Portfolio', ph: 'yoursite.dev' },
                ].map(f => (
                  <div key={f.key} className="field" style={f.key === 'linkedin' || f.key === 'github' || f.key === 'portfolio' ? { gridColumn: 'span 2' } : {}}>
                    <label className="label">{f.label}</label>
                    <input className="input" placeholder={f.ph} value={resume.personalInfo[f.key] || ''}
                      onChange={e => updatePI(f.key, e.target.value)} id={`pi-${f.key}`} />
                  </div>
                ))}
              </div>
            </SectionWrapper>

            {/* Summary */}
            <SectionWrapper icon="📝" title="Professional Summary">
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <AIButton onClick={generateSummary} loading={aiLoading['summary']} label="Generate Summary ✨" />
                </div>
                <textarea className="textarea" rows={4} placeholder="Write a 3-4 sentence professional summary highlighting your key skills and career goals..."
                  value={resume.summary} onChange={e => update('summary', e.target.value)} id="summary-input" />
              </div>
            </SectionWrapper>

            {/* Skills */}
            <SectionWrapper icon="⚙️" title="Skills">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.75rem' }}>
                {[
                  { key: 'technical', label: '💻 Technical / Programming', ph: 'e.g. Python, Java, React…', color: '' },
                  { key: 'databases', label: '🗄 Databases', ph: 'e.g. MongoDB, PostgreSQL, SQL…', color: '' },
                  { key: 'tools', label: '🛠 Tools & Frameworks', ph: 'e.g. Docker, Git, AWS…', color: '' },
                  { key: 'languages', label: '🌐 Languages', ph: 'e.g. English, Hindi…', color: '' },
                  { key: 'soft', label: '🤝 Soft Skills', ph: 'e.g. Leadership, Communication…', color: '' },
                ].map(sk => (
                  <div key={sk.key}>
                    <label className="label" style={{ marginBottom: '0.375rem' }}>{sk.label}</label>
                    <TagInput tags={resume.skills[sk.key] || []} onChange={tags => updateSkills(sk.key, tags)} placeholder={sk.ph} />
                  </div>
                ))}
              </div>
            </SectionWrapper>

            {/* Education */}
            <SectionWrapper icon="🎓" title="Education">
              <div style={{ marginTop: '0.75rem' }}>
                {(resume.education || []).map((ed, idx) => (
                  <div key={ed._id || idx} className="resume-section-block">
                    <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '0.625rem', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {ed.institution || `Education ${idx + 1}`}
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeEntry('education', idx)}>🗑</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { field: 'institution', label: 'Institution / School', ph: 'e.g. NIT Jamshedpur or High School', span: 2 },
                        { field: 'degree', label: 'Degree / Class', ph: 'e.g. B.Tech or Class XII / Class X' },
                        { field: 'branch', label: 'Branch / Stream', ph: 'e.g. CSE or PCM / General' },
                        { field: 'cgpa', label: 'CGPA / Percentage', ph: 'e.g. 8.5/10 or 94.8%' },
                        { field: 'location', label: 'Location', ph: 'Jamshedpur' },
                        { field: 'startYear', label: 'Start Year', ph: '2021' },
                        { field: 'endYear', label: 'End Year', ph: '2025' },
                      ].map(f => (
                        <div key={f.field} className="field" style={f.span ? { gridColumn: `span ${f.span}` } : {}}>
                          <label className="label">{f.label}</label>
                          <input className="input input-sm" placeholder={f.ph} value={ed[f.field] || ''}
                            onChange={e => updateEntry('education', idx, f.field, e.target.value)} />
                        </div>
                      ))}
                      <div className="field" style={{ gridColumn: 'span 2' }}>
                        <label className="label">Relevant Courses</label>
                        <TagInput tags={ed.relevantCourses || []} onChange={tags => updateEntry('education', idx, 'relevantCourses', tags)}
                          placeholder="e.g. Data Structures, OS, DBMS" />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addEntry('education', {
                  institution: '', degree: 'B.Tech', branch: '', cgpa: '', startYear: '', endYear: '', location: '', relevantCourses: []
                })} id="add-education">+ Add Education</button>
              </div>
            </SectionWrapper>

            {/* Experience */}
            <SectionWrapper icon="💼" title="Work Experience">
              <div style={{ marginTop: '0.75rem' }}>
                {(resume.experience || []).map((exp, idx) => (
                  <div key={exp._id || idx} className="resume-section-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {exp.role || `Experience ${idx + 1}`}
                      </span>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <AIButton onClick={() => polishBullets('experience', idx, exp.points || [])}
                          loading={aiLoading[`experience-${idx}`]} label="Polish ✨" small />
                        <button className="btn btn-ghost btn-sm" onClick={() => removeEntry('experience', idx)}>🗑</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {[
                        { field: 'role', label: 'Job Title', ph: 'Software Engineer Intern', span: 2 },
                        { field: 'company', label: 'Company', ph: 'Google' },
                        { field: 'location', label: 'Location', ph: 'Bengaluru, India' },
                        { field: 'startDate', label: 'Start Date', ph: 'Jun 2024' },
                        { field: 'endDate', label: 'End Date', ph: 'Aug 2024 (or Present)' },
                      ].map(f => (
                        <div key={f.field} className="field" style={f.span ? { gridColumn: `span ${f.span}` } : {}}>
                          <label className="label">{f.label}</label>
                          <input className="input input-sm" placeholder={f.ph} value={exp[f.field] || ''}
                            onChange={e => updateEntry('experience', idx, f.field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div className="field" style={{ marginBottom: '0.5rem' }}>
                      <label className="label">Bullet Points (one per line)</label>
                      <textarea className="textarea" rows={4}
                        placeholder="• Built a scalable REST API serving 10K+ requests/day using Node.js and Redis&#10;• Reduced page load time by 40% through code splitting and lazy loading"
                        value={(exp.points || []).join('\n')}
                        onChange={e => updateEntry('experience', idx, 'points', e.target.value.split('\n'))} />
                    </div>
                    <div className="field">
                      <label className="label">Technologies Used</label>
                      <TagInput tags={exp.techUsed || []} onChange={tags => updateEntry('experience', idx, 'techUsed', tags)}
                        placeholder="e.g. React, Node.js, PostgreSQL" />
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addEntry('experience', {
                  role: '', company: '', startDate: '', endDate: '', location: '', isCurrentRole: false, points: [], techUsed: []
                })} id="add-experience">+ Add Experience</button>
              </div>
            </SectionWrapper>

            {/* Projects */}
            <SectionWrapper icon="🚀" title="Projects">
              <div style={{ marginTop: '0.75rem' }}>
                {(resume.projects || []).map((proj, idx) => (
                  <div key={proj._id || idx} className="resume-section-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {proj.name || `Project ${idx + 1}`}
                      </span>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <AIButton onClick={() => polishBullets('projects', idx, proj.points || [])}
                          loading={aiLoading[`projects-${idx}`]} label="Polish ✨" small />
                        <button className="btn btn-ghost btn-sm" onClick={() => removeEntry('projects', idx)}>🗑</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {[
                        { field: 'name', label: 'Project Name', ph: 'AlumniConnect', span: 2 },
                        { field: 'githubLink', label: 'GitHub Link', ph: 'github.com/user/repo' },
                        { field: 'liveLink', label: 'Live Link', ph: 'yourproject.vercel.app' },
                        { field: 'startDate', label: 'Start Date', ph: 'Jan 2024' },
                        { field: 'endDate', label: 'End Date', ph: 'Mar 2024' },
                      ].map(f => (
                        <div key={f.field} className="field" style={f.span ? { gridColumn: `span ${f.span}` } : {}}>
                          <label className="label">{f.label}</label>
                          <input className="input input-sm" placeholder={f.ph} value={proj[f.field] || ''}
                            onChange={e => updateEntry('projects', idx, f.field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div className="field" style={{ marginBottom: '0.5rem' }}>
                      <label className="label">Tech Stack</label>
                      <TagInput tags={proj.techStack || []} onChange={tags => updateEntry('projects', idx, 'techStack', tags)}
                        placeholder="e.g. React, MongoDB, Express" />
                    </div>
                    <div className="field">
                      <label className="label">Description / Bullet Points (one per line)</label>
                      <textarea className="textarea" rows={3}
                        placeholder="• Developed a full-stack alumni networking platform serving 500+ users&#10;• Integrated Groq AI for real-time resume analysis and ATS scoring"
                        value={(proj.points || []).join('\n')}
                        onChange={e => updateEntry('projects', idx, 'points', e.target.value.split('\n'))} />
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addEntry('projects', {
                  name: '', description: '', techStack: [], githubLink: '', liveLink: '', startDate: '', endDate: '', points: []
                })} id="add-project">+ Add Project</button>
              </div>
            </SectionWrapper>

            {/* Achievements */}
            <SectionWrapper icon="🏆" title="Achievements & Awards">
              <div style={{ marginTop: '0.75rem' }}>
                {(resume.achievements || []).map((ach, idx) => (
                  <div key={ach._id || idx} className="resume-section-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{ach.title || `Achievement ${idx + 1}`}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeEntry('achievements', idx)}>🗑</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { field: 'title', label: 'Title', ph: 'Smart India Hackathon Winner', span: 2 },
                        { field: 'organization', label: 'Organization', ph: 'Ministry of Education' },
                        { field: 'year', label: 'Year', ph: '2024' },
                        { field: 'description', label: 'Description', ph: 'Developed an AI-based solution…', span: 2 },
                      ].map(f => (
                        <div key={f.field} className="field" style={f.span ? { gridColumn: `span ${f.span}` } : {}}>
                          <label className="label">{f.label}</label>
                          <input className="input input-sm" placeholder={f.ph} value={ach[f.field] || ''}
                            onChange={e => updateEntry('achievements', idx, f.field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addEntry('achievements', {
                  title: '', description: '', year: '', organization: ''
                })} id="add-achievement">+ Add Achievement</button>
              </div>
            </SectionWrapper>

            {/* Certifications */}
            <SectionWrapper icon="📜" title="Certifications">
              <div style={{ marginTop: '0.75rem' }}>
                {(resume.certifications || []).map((cert, idx) => (
                  <div key={cert._id || idx} className="resume-section-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{cert.name || `Certification ${idx + 1}`}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeEntry('certifications', idx)}>🗑</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { field: 'name', label: 'Certification Name', ph: 'AWS Solutions Architect', span: 2 },
                        { field: 'issuer', label: 'Issuer', ph: 'Amazon Web Services' },
                        { field: 'year', label: 'Year', ph: '2024' },
                        { field: 'credentialId', label: 'Credential ID', ph: 'ABCD-1234' },
                        { field: 'link', label: 'Verification Link', ph: 'credentials.yourissuer.com/…' },
                      ].map(f => (
                        <div key={f.field} className="field" style={f.span ? { gridColumn: `span ${f.span}` } : {}}>
                          <label className="label">{f.label}</label>
                          <input className="input input-sm" placeholder={f.ph} value={cert[f.field] || ''}
                            onChange={e => updateEntry('certifications', idx, f.field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => addEntry('certifications', {
                  name: '', issuer: '', year: '', credentialId: '', link: ''
                })} id="add-cert">+ Add Certification</button>
              </div>
            </SectionWrapper>
          </div>

          {/* Right: Live Preview */}
          <div style={{ position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', borderRadius: 'var(--radius-lg)', scrollbarWidth: 'thin' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Live Preview</span>
              <div className="ai-badge">● ATS-Friendly</div>
            </div>
            <ResumePreview data={resume} />
          </div>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} id="print-btn">🖨 Print / Export PDF</button>
          </div>
          <div ref={printRef}>
            <ResumePreview data={resume} />
          </div>
        </div>
      )}

      {/* ── ATS CHECK TAB ── */}
      {activeTab === 'ats' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {/* Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>🎯 ATS Score Analyzer</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Check your ATS compatibility score against a job description. Use your current builder resume, upload an existing PDF/Word file, or paste resume text directly.
              </p>
            </div>

            {/* Source Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">Resume Source</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'current', icon: '📝', label: 'Use Builder Resume' },
                  { id: 'upload', icon: '📎', label: 'Upload PDF / DOCX' },
                  { id: 'paste', icon: '📋', label: 'Paste Resume Text' },
                ].map(src => (
                  <button key={src.id}
                    onClick={() => { setAtsResumeSource(src.id); setUploadedResumeText(''); setAtsResult(null); }}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s',
                      background: atsResumeSource === src.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${atsResumeSource === src.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      color: atsResumeSource === src.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    }}>
                    {src.icon} {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Builder Resume — just a note */}
            {atsResumeSource === 'current' && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
                fontSize: '0.875rem', color: '#34d399', marginBottom: '1rem',
              }}>
                ✓ Your current Resume Builder content will be used for analysis.
              </div>
            )}

            {/* Upload File */}
            {atsResumeSource === 'upload' && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="resume-file-input"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(99,102,241,0.35)', borderRadius: 'var(--radius-md)',
                    padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(99,102,241,0.04)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.65)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'}
                >
                  {parsing ? (
                    <div style={{ color: 'var(--text-muted)' }}>⏳ Extracting text from document…</div>
                  ) : uploadedResumeText ? (
                    <div>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>✅</div>
                      <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.875rem' }}>
                        Document uploaded & parsed successfully
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                        {uploadedResumeText.length} characters extracted · Click to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📎</div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Click to upload your resume</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Supports PDF and DOCX files</div>
                    </div>
                  )}
                </div>
                {uploadedResumeText && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                    onClick={() => { setUploadedResumeText(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    × Clear uploaded file
                  </button>
                )}
              </div>
            )}

            {/* Paste Text */}
            {atsResumeSource === 'paste' && (
              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="label">Paste Your Resume Text</label>
                <textarea className="textarea" rows={10}
                  placeholder="Paste the full text content of your resume here…&#10;&#10;Include your name, contact, skills, education, work experience, projects, achievements etc."
                  value={uploadedResumeText}
                  onChange={e => setUploadedResumeText(e.target.value)}
                  id="paste-resume-input"
                />
                {uploadedResumeText && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    {uploadedResumeText.split(/\s+/).filter(Boolean).length} words · {uploadedResumeText.length} characters
                  </div>
                )}
              </div>
            )}

            {/* Job Description */}
            <div className="field" style={{ marginBottom: '1.25rem' }}>
              <label className="label">
                Job Description
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>(optional but recommended)</span>
              </label>
              <textarea className="textarea" rows={6}
                placeholder="Paste the full job description here for the most accurate ATS score and keyword matching…"
                value={jobDesc} onChange={e => setJobDesc(e.target.value)} id="job-desc-input" />
            </div>

            <button
              className={`btn btn-primary btn-lg${atsChecking ? ' btn-loading' : ''}`}
              onClick={checkATS}
              disabled={atsChecking || parsing || (atsResumeSource !== 'current' && !uploadedResumeText.trim())}
              id="check-ats-btn">
              {atsChecking ? 'Analyzing with Groq AI…' : '🎯 Check ATS Score'}
            </button>
          </div>

          {atsResult && <ATSPanel score={atsResult.atsScore} result={atsResult} />}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .resume-preview, .resume-preview * {
            visibility: visible !important;
          }
          .resume-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .navbar, .tabs, .page-header, [class*="btn"], .alert {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
