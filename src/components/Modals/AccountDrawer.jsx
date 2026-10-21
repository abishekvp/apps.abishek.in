import React, { useState, useEffect } from 'react';
import { X, User, Mail, Bell, Shield, LogOut, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/icons';

export default function AccountDrawer({ isOpen, onClose, onOpenAdmin }) {
  const { currentUser, logout, updatePreferences } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [loadingBugs, setLoadingBugs] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setLoadingBugs(true);
      fetch('/api/bugs/mine')
        .then((res) => (res.ok ? res.json() : { bugs: [] }))
        .then((data) => setBugs(data.bugs || []))
        .catch(() => setBugs([]))
        .finally(() => setLoadingBugs(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleToggleNotify = (e) => {
    updatePreferences(e.target.checked);
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h3 className="modal-title">Account & Profile</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {/* User profile card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getInitials(currentUser.name || currentUser.email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-semibold text-base truncate">{currentUser.name || 'Developer'}</div>
              <div className="text-secondary text-xs truncate">{currentUser.email}</div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="badge"
                  style={{
                    background: currentUser.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: currentUser.role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                    borderColor: currentUser.role === 'admin' ? 'var(--primary)' : 'var(--border-subtle)'
                  }}
                >
                  {currentUser.role === 'admin' ? 'Admin Access' : 'Verified Member'}
                </span>
                {currentUser.role === 'admin' && (
                  <a
                    href="/admin"
                    onClick={(e) => {
                      if (onOpenAdmin) {
                        e.preventDefault();
                        onClose();
                        onOpenAdmin();
                      }
                    }}
                    className="btn btn-sm btn-admin"
                    style={{ padding: '3px 8px', fontSize: '11px', textDecoration: 'none' }}
                  >
                    <Shield size={12} />
                    <span>Admin Portal</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-4">
            <div className="font-medium text-sm mb-3">Notification Preferences</div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-secondary" />
                <div>
                  <div className="text-sm font-medium">New Tool Releases</div>
                  <div className="text-secondary text-xs">Notify me when new developer tools launch</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(currentUser.notify_new_tools)}
                onChange={handleToggleNotify}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Activity / Bug reports section */}
          <div>
            <div className="font-medium text-sm mb-2 flex items-center justify-between">
              <span>My Bug Reports & Inquiries</span>
              <span className="text-xs text-muted">({bugs.length})</span>
            </div>

            {loadingBugs ? (
              <div className="text-xs text-muted py-3">Loading your activity...</div>
            ) : bugs.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem'
                }}
              >
                No bug reports filed yet. If you run into issues with any app, report them here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bugs.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{b.title}</span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.7rem',
                          background: b.status === 'resolved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: b.status === 'resolved' ? 'var(--success)' : 'var(--warning)',
                          borderColor: 'transparent'
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-secondary text-xs truncate">{b.tool_name} &bull; {b.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
