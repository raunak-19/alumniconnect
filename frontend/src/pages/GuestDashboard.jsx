import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const stats = [
  { label: 'Highest Package', value: '₹54 LPA', color: 'var(--accent-emerald)', icon: '💰' },
  { label: 'Average Package', value: '₹14.8 LPA', color: 'var(--text-primary)', icon: '📊' },
  { label: 'Placement Rate', value: '86%', color: 'var(--primary-light)', icon: '🎯' },
  { label: 'Total Offers', value: '700+', color: 'var(--accent-cyan)', icon: '📋' },
];

const features = [
  { icon: '🤖', title: 'AI Career Copilot', desc: 'Chat with AI for resume tips, interview prep, and career guidance — powered by Groq' },
  { icon: '📄', title: 'Smart Resume Builder', desc: 'Build ATS-friendly engineering resumes with live preview and AI polish' },
  { icon: '🔗', title: 'Alumni Network', desc: 'Connect with verified NIT JSR alumni at Google, Amazon, Microsoft, and more' },
  { icon: '🎯', title: 'ATS Scoring', desc: 'Analyze your resume against job descriptions and get specific improvement suggestions' },
  { icon: '🗺', title: 'Career Roadmaps', desc: 'Get personalized learning paths to your target role with phase-by-phase milestones' },
  { icon: '✉', title: 'Referral Messages', desc: 'Generate professional outreach messages to alumni at your target companies' },
];

const recruiters = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Tata Steel', 'Samsung', 'Infosys', 'Wipro', 'TCS', 'Cognizant', 'Goldman Sachs', 'JP Morgan'];

export default function GuestDashboard() {
  return (
    <div className="page">
      <div className="app-bg" />
      <Navbar />
      <div className="page-content">
        {/* Hero */}
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', marginBottom: '2rem',
          background: 'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.05) 100%)',
          borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              👁 Guest Preview Mode
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
              NIT Jamshedpur's{' '}
              <span className="gradient-text">Alumni Network</span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
              The exclusive platform connecting students and alumni for referrals, career guidance, and AI-powered resume building.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="guest-register">
                🚀 Join Now — It's Free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg" id="guest-login-link">
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Placement Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', textAlign: 'center' }}>
            Placement Highlights 2024–25
          </div>
          <div className="grid-4">
            {stats.map(s => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: '1.625rem', textAlign: 'center' }}>{s.value}</div>
                <div className="stat-label" style={{ textAlign: 'center' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
              Everything you need to <span className="gradient-text">land your dream job</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Register to unlock all features</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.375rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
                <div style={{
                  position: 'absolute', top: 0, right: 0, padding: '0.25rem 0.5rem',
                  borderBottomLeftRadius: 'var(--radius-sm)',
                  background: 'rgba(99,102,241,0.15)',
                  fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 700,
                }}>Members Only</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiters */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Top Recruiters
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {recruiters.map(r => (
              <span key={r} className="badge badge-default" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>{r}</span>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Join AlumniConnect to connect with alumni at these companies for referrals
            </p>
            <Link to="/register" className="btn btn-primary" id="guest-cta-register">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
