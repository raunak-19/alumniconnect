import React, { useState, useEffect } from 'react';
import ConnectModal from './ConnectModal';

import { API_URL as API } from '../services/api';
const token = () => localStorage.getItem('alumniconnect_token');

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

export default function InboxPanel({ user }) {
  const [view, setView] = useState('inbox'); // 'inbox' | 'outbox'
  const [inbox, setInbox] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // { id, name, designation, company }

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inRes, outRes] = await Promise.all([
        fetch(`${API}/messages/inbox`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/messages/outbox`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const [inData, outData] = await Promise.all([inRes.json(), outRes.json()]);
      if (Array.isArray(inData)) setInbox(inData);
      if (Array.isArray(outData)) setOutbox(outData);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 8000);
    return () => clearInterval(iv);
  }, []);

  const messages = view === 'inbox' ? inbox : outbox;
  const unreadCount = inbox.length; // Could track read state later

  return (
    <div>
      {/* Inbox/Outbox toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'inbox', label: `📥 Inbox`, count: inbox.length },
          { id: 'outbox', label: `📤 Outbox`, count: outbox.length },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: '0.5rem 1.125rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${view === v.id ? 'var(--primary)' : 'var(--border-default)'}`,
              background: view === v.id ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: view === v.id ? 'var(--primary-light)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {v.label}
            <span style={{
              background: view === v.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              color: 'white', borderRadius: '100px',
              fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem',
              minWidth: 22, textAlign: 'center',
            }}>
              {v.count}
            </span>
          </button>
        ))}
        <button
          onClick={fetchAll}
          style={{
            marginLeft: 'auto', padding: '0.5rem 0.75rem',
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.75rem',
          }}
        >↺ Refresh</button>
      </div>

      {/* Message list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              {view === 'inbox' ? '📭' : '📤'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              {view === 'inbox' ? 'No messages received yet.' : 'No messages sent yet.'}
            </div>
          </div>
        ) : messages.map(msg => {
          const isInbox = view === 'inbox';
          const otherName = isInbox ? msg.senderName : msg.receiverName;
          const otherId = isInbox ? msg.sender : msg.receiver;

          return (
            <div
              key={msg._id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'rgba(255,255,255,0.015)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
              }}
              onClick={() => setReplyTo({ id: otherId?.toString(), name: otherName || 'User' })}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: isInbox
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : 'linear-gradient(135deg,#10b981,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.875rem', color: 'white',
              }}>
                {(otherName || '?')[0].toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                    {isInbox ? '↙ From: ' : '↗ To: '}
                    <span style={{ color: isInbox ? 'var(--primary-light)' : 'var(--accent-emerald)' }}>
                      {otherName || 'Unknown'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.875rem', color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {msg.content}
                </div>
              </div>

              {/* Reply badge */}
              <div style={{
                flexShrink: 0,
                fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--primary-light)', padding: '0.2rem 0.5rem',
                border: '1px solid var(--primary)', borderRadius: '100px',
                opacity: 0.75,
              }}>
                {isInbox ? 'Reply' : 'View'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thread modal */}
      {replyTo && (
        <ConnectModal
          recipient={replyTo}
          onClose={() => { setReplyTo(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
