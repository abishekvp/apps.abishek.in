import React, { useState, useEffect } from 'react';
import { X, Bug, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BugModal({ isOpen, onClose, initialToolSlug = '', tools = [] }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [toolSlug, setToolSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialToolSlug) {
      setToolSlug(initialToolSlug);
    } else if (tools.length > 0 && !toolSlug) {
      setToolSlug(tools[0].slug);
    }
  }, [initialToolSlug, tools]);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const selectedTool = tools.find((t) => t.slug === toolSlug);
    const toolName = selectedTool ? selectedTool.name : toolSlug;

    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_slug: toolSlug,
          tool_name: toolName,
          title,
          description,
          steps_to_reproduce: steps,
          severity,
          email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit bug report');

      showToast(data.message || 'Bug report submitted. Thank you!', 'success');
      setTitle('');
      setDescription('');
      setSteps('');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Bug size={18} className="text-secondary" />
            <h3 className="modal-title">Report a Bug / Issue</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              Found a bug, broken edge case, or display issue? Let us know and we will fix it.
            </p>

            <div className="form-group">
              <label>Affected Tool <span className="required">*</span></label>
              <select
                className="form-select"
                value={toolSlug}
                onChange={(e) => setToolSlug(e.target.value)}
                required
              >
                {tools.map((t) => (
                  <option key={t.id || t.slug} value={t.slug}>
                    {t.name} ({t.slug})
                  </option>
                ))}
                <option value="platform-general">General Platform / Portal</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Issue Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. JSON formatter throws syntax error on large input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ width: '160px' }}>
                <label>Severity</label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="low">Low - Minor</option>
                  <option value="medium">Medium - Annoyance</option>
                  <option value="high">High - Feature broken</option>
                  <option value="critical">Critical - App unusable</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description of Issue <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="What happened? What did you expect to happen instead?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                className="form-textarea"
                placeholder="1. Go to... 2. Paste input... 3. Click button..."
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Your Email <span className="required">*</span></label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="text-muted text-xs mt-1 block">
                Used strictly to notify you once the fix has been deployed.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
