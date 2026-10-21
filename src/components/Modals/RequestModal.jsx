import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RequestModal({ isOpen, onClose, onRequestSubmitted }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [useCases, setUseCases] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.name) setName(currentUser.name);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, use_cases: useCases, name, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      showToast(data.message || 'Tool request submitted successfully!', 'success');
      setTitle('');
      setDescription('');
      setUseCases('');
      onClose();
      if (onRequestSubmitted) onRequestSubmitted();
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
          <h3 className="modal-title">Request a New Tool</h3>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              Have a tool idea you want to see built on the platform? Your name will be permanently credited when published:
            </p>

            <div className="form-group">
              <label>Tool Idea / Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cron Expression Generator, Har to Curl Converter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description & Purpose <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="Explain what the tool should do and why it is useful..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Key Features & Use Cases</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Needs syntax highlighting, export to JSON..."
                value={useCases}
                onChange={(e) => setUseCases(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Your Name (Displayed on Tool Credit)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group flex-1">
                <label>Your Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
