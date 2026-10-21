import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function NotifyModal({ isOpen, onClose, tool = null }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tool_slug: tool?.slug || 'all'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');

      showToast(data.message || 'Subscribed for launch notification!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h3 className="modal-title">Launch Notification</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              {tool
                ? `Enter your email to receive an instant alert as soon as ${tool.name} is deployed and ready to use.`
                : 'Subscribe to receive updates whenever a new community tool or platform update goes live.'}
            </p>

            {tool && (
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px'
                }}
              >
                <div className="font-semibold text-sm mb-1">{tool.name}</div>
                <div className="text-secondary text-xs">{tool.short_desc}</div>
              </div>
            )}

            <div className="form-group">
              <label>Your Email Address <span className="required">*</span></label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <span className="text-muted text-xs mt-1 block">
                Zero spam. You can unsubscribe anytime with one click.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Bell size={15} />
              {submitting ? 'Subscribing...' : 'Notify Me'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
