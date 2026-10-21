import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }) {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setError('');
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err.message || 'Authentication failed');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h3 className="modal-title">
              {tab === 'signin' ? 'Sign In to apps.abishek.in' : 'Create an Account'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 24px',
            gap: '8px'
          }}
        >
          <button
            type="button"
            className={`btn-ghost ${tab === 'signin' ? 'text-primary' : 'text-secondary'}`}
            style={{
              padding: '12px 16px',
              borderBottom: tab === 'signin' ? '2px solid var(--primary)' : '2px solid transparent',
              borderRadius: 0,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
            onClick={() => { setTab('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn-ghost ${tab === 'signup' ? 'text-primary' : 'text-secondary'}`}
            style={{
              padding: '12px 16px',
              borderBottom: tab === 'signup' ? '2px solid var(--primary)' : '2px solid transparent',
              borderRadius: 0,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '16px'
                }}
              >
                {error}
              </div>
            )}

            {tab === 'signup' && (
              <div className="form-group">
                <label>Full Name or Display Name <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="e.g. Sarah Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <span className="text-muted text-xs mt-1 block">
                  This name will be credited on tool suggestions you submit.
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Password (minimum 4 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (tab === 'signin' ? 'Sign In' : 'Create Account')}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
