import React, { useState, useEffect, useRef } from 'react';

import { API_URL as API } from '../services/api';
const token = () => localStorage.getItem('alumniconnect_token');

export default function ConnectModal({ recipient, onClose }) {
  // recipient: { id, name, designation, company }
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchThread = async () => {
    try {
      const res = await fetch(`${API}/messages/thread/${recipient.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setThread(data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchThread();
    const iv = setInterval(fetchThread, 6000); // Poll every 6s
    return () => clearInterval(iv);
  }, [recipient.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ receiverId: recipient.id, receiverName: recipient.name, content: text.trim() }),
      });
      if (res.ok) { setText(''); fetchThread(); }
    } catch (_) {}
    setSending(false);
  };

  // Get current user ID from token (JWT payload)
  let myId = null;
  try {
    const tk = token();
    if (tk) {
      const parts = tk.split('.');
      if (parts.length > 1) {
        const payload = JSON.parse(atob(parts[1]));
        myId = payload.id || payload._id || payload.userId;
      }
    }
  } catch (_) {}

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(20px) saturate(0.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(0.4)',
          zIndex: 1000,
        }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: 520,
        background: '#13151f',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 32px 96px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '80vh', zIndex: 1001,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(99,102,241,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', color: 'white',
            }}>
              {(recipient.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {recipient.name}
              </div>
              {(recipient.designation || recipient.company) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {recipient.designation}{recipient.company ? ` at ${recipient.company}` : ''}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
              padding: '0.375rem 0.625rem', fontSize: '1.125rem', lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.625rem',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem' }}>Loading messages…</div>
          ) : thread.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              <div style={{ fontSize: '0.875rem' }}>Start a conversation with <strong>{recipient.name}</strong>!</div>
            </div>
          ) : thread.map(msg => {
            const isMe = msg.sender?.toString() === myId?.toString();
            return (
              <div key={msg._id} style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '72%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe
                    ? 'linear-gradient(135deg, var(--primary), var(--accent-violet))'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  boxShadow: isMe ? '0 2px 12px var(--primary-glow)' : 'none',
                }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '0.6875rem', opacity: 0.6, marginTop: '0.25rem', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div style={{
          padding: '0.875rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: '0.625rem', alignItems: 'flex-end',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${recipient.name}… (Enter to send)`}
            style={{
              flex: 1, resize: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '0.625rem 0.75rem',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={send}
            disabled={sending || !text.trim()}
            style={{ minWidth: 72, alignSelf: 'flex-end' }}
          >
            {sending ? '…' : '↑ Send'}
          </button>
        </div>
      </div>
    </>
  );
}
