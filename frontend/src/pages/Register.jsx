import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../services/api';

const BRANCHES = [
  'Computer Science and Engineering (CSE)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Production and Industrial Engineering (PIE)',
  'Metallurgical and Materials Engineering (MME)',
  'Engineering & Computational Mechanics (ECM)',
];

const steps = ['Account Type', 'Personal Info', 'Credentials & Document'];

export default function Register() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 4 - 1964 + 1 }, (_, i) => currentYear + 4 - i);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    accountType: '', fullName: '', branch: '', graduationYear: '',
    email: '', password: '', confirmPassword: '',
  });
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false); // success state

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setError(''); };

  const nextStep = () => {
    if (step === 0 && !form.accountType) { setError('Please select an account type.'); return; }
    if (step === 1) {
      if (!form.fullName.trim()) { setError('Full name is required.'); return; }
      if (!form.branch) { setError('Please select your branch.'); return; }
      if (!form.graduationYear) { setError('Please select your graduation year.'); return; }
      if (form.accountType === 'Alumni' && parseInt(form.graduationYear, 10) > currentYear) {
        setError(`Graduation year ${form.graduationYear} is in the future. Alumni must have already graduated.`);
        return;
      }
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or PDF files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setDocFile(file);
    setError('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setDocPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setDocPreview('pdf');
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) { setError('Email is required.'); return; }
    if (form.accountType === 'Student' && !/@nitjsr\.ac\.in$/i.test(form.email)) {
      setError('Students must use their @nitjsr.ac.in institutional email.');
      return;
    }
    if (form.accountType === 'Alumni' && !isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.password) { setError('Password is required.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!docFile) { setError('A verification document is required. Please upload your ID card, registration slip, or degree certificate.'); return; }

    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('name', form.fullName);
      fd.append('department', form.branch);
      fd.append('graduationYear', form.graduationYear || currentYear);
      fd.append('accountType', form.accountType);
      if (docFile) fd.append('document', docFile);

      const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      // Show pending screen instead of navigating to dashboard
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── SUCCESS / PENDING SCREEN ────────────────────── */
  if (submitted) {
    return (
      <div className="page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="app-bg" />
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }} className="fade-in">
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 8px 32px rgba(52,211,153,0.35)',
          }}>⏳</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Application Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Your registration is now pending admin verification.<br />
            The placement cell will review your details
            {docFile ? ' and the document you uploaded' : ''}.<br /><br />
            <strong style={{ color: 'var(--text-primary)' }}>Please return to login later</strong> — you will be able to
            sign in once your account has been approved.
          </p>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            {[
              { label: 'Email', val: form.email },
              { label: 'Role', val: form.accountType },
              { label: 'Branch', val: form.branch },
              { label: 'Document', val: docFile ? docFile.name : 'Not submitted (optional)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.val}</span>
              </div>
            ))}
          </div>
          <Link to="/login" className="btn btn-primary btn-lg btn-full" style={{ display: 'block' }}>
            Return to Login →
          </Link>
        </div>
      </div>
    );
  }

  /* ─── REGISTRATION FORM ────────────────────────────── */
  return (
    <div className="page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="app-bg" />

      <div style={{ width: '100%', maxWidth: '540px' }} className="fade-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <div className="nav-logo-icon" style={{ width: 40, height: 40 }}>A</div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>AlumniConnect</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Join the NIT Jamshedpur alumni network
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', opacity: i <= step ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.3s',
                  background: i < step ? 'var(--accent-emerald)' : i === step ? 'var(--primary)' : 'var(--bg-card)',
                  border: `2px solid ${i < step ? 'var(--accent-emerald)' : i === step ? 'var(--primary)' : 'var(--border-default)'}`,
                  color: i <= step ? 'white' : 'var(--text-muted)',
                  boxShadow: i === step ? '0 0 12px var(--primary-glow)' : 'none',
                }}>{i < step ? '✓' : i + 1}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 0.5rem', marginBottom: '1.2rem', background: i < step ? 'var(--accent-emerald)' : 'var(--border-default)', transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card card-xl">
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠ {error}</div>}

          {/* ── STEP 0: Account Type ── */}
          {step === 0 && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>Who are you?</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Your document will be verified by the placement cell before access is granted.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { value: 'Student', icon: '🎓', desc: 'Currently enrolled at NIT JSR', docHint: 'ID Card or Registration Slip' },
                  { value: 'Alumni',  icon: '👔', desc: 'Graduated from NIT JSR',         docHint: 'Degree Certificate or Alumni Card' },
                ].map(at => (
                  <button key={at.value} type="button" onClick={() => set('accountType', at.value)}
                    id={`account-type-${at.value.toLowerCase()}`}
                    style={{
                      padding: '1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      border: `2px solid ${form.accountType === at.value ? 'var(--primary)' : 'var(--border-default)'}`,
                      background: form.accountType === at.value ? 'rgba(99,102,241,0.12)' : 'var(--bg-input)',
                      textAlign: 'left', transition: 'all 0.2s',
                      boxShadow: form.accountType === at.value ? '0 0 0 1px var(--primary), 0 0 16px var(--primary-glow)' : 'none',
                    }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{at.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{at.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{at.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      📄 {at.docHint}
                    </div>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={nextStep} id="step0-next">Continue →</button>
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>About you</h2>

              <div className="field">
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Raunak Srivastava" value={form.fullName}
                  onChange={e => set('fullName', e.target.value)} id="reg-name" />
              </div>

              <div className="field">
                <label className="label">Branch / Department</label>
                <select className="select" value={form.branch} onChange={e => set('branch', e.target.value)} id="reg-branch">
                  <option value="">Select your branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="label">Graduation Year</label>
                <select className="select" value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)} id="reg-year">
                  <option value="">Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-outline btn-lg" onClick={() => setStep(0)} style={{ flex: 1 }}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={nextStep} style={{ flex: 2 }} id="step1-next">Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Credentials + Document ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>Credentials & Verification</h2>

              <div className="field">
                <label className="label">
                  {form.accountType === 'Alumni' ? 'Email Address' : 'NIT JSR Email'}
                  {' '}<span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input className="input" type="email"
                  placeholder={form.accountType === 'Alumni' ? 'e.g. yourname@gmail.com' : 'yourrollno@nitjsr.ac.in'}
                  value={form.email} onChange={e => set('email', e.target.value)} id="reg-email" />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>
                  {form.accountType === 'Alumni'
                    ? 'Any valid email address is accepted for alumni'
                    : 'Students must use their @nitjsr.ac.in institutional email'}
                </div>
              </div>

              <div className="field">
                <label className="label">Password <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters" value={form.password}
                    onChange={e => set('password', e.target.value)}
                    id="reg-password" style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
                  }}>{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>

              <div className="field">
                <label className="label">Confirm Password <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                <input className="input" type="password" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} id="reg-confirm" />
              </div>

              {/* Document Upload */}
              <div className="field">
                <label className="label">
                  Verification Document <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
                    ({form.accountType === 'Alumni' ? 'Degree Certificate / Alumni Card' : 'ID Card / Registration Slip'})
                  </span>
                </label>

                <label htmlFor="reg-document" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                  border: `2px dashed ${docFile ? 'var(--accent-emerald)' : 'var(--border-default)'}`,
                  background: docFile ? 'rgba(52,211,153,0.06)' : 'var(--bg-input)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {docPreview === 'pdf' ? (
                    <>
                      <span style={{ fontSize: '2rem' }}>📄</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{docFile.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF uploaded · click to change</span>
                    </>
                  ) : docPreview ? (
                    <>
                      <img src={docPreview} alt="Preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{docFile.name} · click to change</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '2rem' }}>📎</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Click to upload document</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, PDF, WEBP · max 10 MB</span>
                    </>
                  )}
                  <input id="reg-document" type="file" accept=".jpg,.jpeg,.png,.pdf,.webp"
                    onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                <div style={{
                  marginTop: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                  fontSize: '0.8rem', color: '#fcd34d', display: 'flex', gap: '0.5rem',
                }}>
                  <span>⚠</span>
                  <span><strong>Notice:</strong> Document verification is required to prevent identity theft. Your application will be rejected without a valid document.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                <button type="submit" className={`btn btn-primary btn-lg${loading ? ' btn-loading' : ''}`}
                  style={{ flex: 2 }} disabled={loading || !docFile} id="reg-submit">
                  {loading ? 'Submitting…' : 'Submit for Verification →'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
