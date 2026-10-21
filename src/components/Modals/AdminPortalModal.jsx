import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Wrench,
  Bug,
  Lightbulb,
  Mail,
  Users,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ToolIcon } from '../../utils/icons';

export default function AdminPortalModal({ isOpen, onClose, onToolsChanged }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tools, setTools] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit / Add Tool Form State
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    url: '',
    icon: 'code',
    category: 'developer',
    badge: 'Active',
    short_desc: '',
    long_desc: '',
    features: '',
    tags: '',
    suggested_by: '',
    is_upcoming: false,
    is_hidden: false,
    launch_date: ''
  });

  useEffect(() => {
    if (isOpen && currentUser?.role === 'admin') {
      fetchOverview();
      fetchTools();
    }
  }, [isOpen, currentUser]);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data.counts);
      }
    } catch {
      // ignore
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tools');
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (err) {
      showToast('Failed to load tools', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bugs');
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') fetchOverview();
    if (tab === 'tools') fetchTools();
    if (tab === 'bugs') fetchBugs();
    if (tab === 'requests') fetchRequests();
    if (tab === 'messages') fetchMessages();
    if (tab === 'subscribers') fetchSubscribers();
  };

  // Tools Actions
  const openNewToolModal = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      slug: '',
      url: '',
      icon: 'code',
      category: 'developer',
      badge: 'Active',
      short_desc: '',
      long_desc: '',
      features: '',
      tags: '',
      suggested_by: '',
      is_upcoming: false,
      is_hidden: false,
      launch_date: ''
    });
    setToolModalOpen(true);
  };

  const openEditToolModal = (tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name || '',
      slug: tool.slug || '',
      url: tool.url || '',
      icon: tool.icon || 'code',
      category: tool.category || 'developer',
      badge: tool.badge || 'Active',
      short_desc: tool.short_desc || '',
      long_desc: tool.long_desc || '',
      features: Array.isArray(tool.features) ? tool.features.join(', ') : (tool.features || ''),
      tags: Array.isArray(tool.tags) ? tool.tags.join(', ') : (tool.tags || ''),
      suggested_by: tool.suggested_by || '',
      is_upcoming: Boolean(tool.is_upcoming),
      is_hidden: Boolean(tool.is_hidden),
      launch_date: tool.launch_date || ''
    });
    setToolModalOpen(true);
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      const url = editingTool ? `/api/admin/tools/${editingTool.id}` : '/api/admin/tools';
      const method = editingTool ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save tool');

      showToast(data.message || 'Tool saved successfully', 'success');
      setToolModalOpen(false);
      fetchTools();
      if (onToolsChanged) onToolsChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleHide = async (toolId) => {
    try {
      const res = await fetch(`/api/admin/tools/${toolId}/toggle-visibility`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'info');
      fetchTools();
      if (onToolsChanged) onToolsChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool permanently?')) return;
    try {
      const res = await fetch(`/api/admin/tools/${toolId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Tool deleted', 'info');
      fetchTools();
      if (onToolsChanged) onToolsChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Bug updates
  const handleUpdateBugStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Bug marked as ${status}`, 'success');
      fetchBugs();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteBug = async (id) => {
    if (!window.confirm('Delete this bug report?')) return;
    await fetch(`/api/admin/bugs/${id}`, { method: 'DELETE' });
    showToast('Bug report deleted', 'info');
    fetchBugs();
  };

  // Request updates
  const handleUpdateRequestStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Request status updated to ${status}`, 'success');
      fetchRequests();
    } catch {
      showToast('Failed to update request', 'error');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
    showToast('Request deleted', 'info');
    fetchRequests();
  };

  // Message updates
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete message?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    showToast('Message deleted', 'info');
    fetchMessages();
  };

  if (!isOpen || currentUser?.role !== 'admin') return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '95%',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ height: '60px', minHeight: '60px', flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-primary" />
            <h3 className="modal-title">Admin Management Portal</h3>
            <span className="badge" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              Restricted
            </span>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="admin-nav-bar"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            overflowX: 'auto',
            overflowY: 'hidden',
            flexShrink: 0,
            minHeight: '52px',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard size={15} /> <span>Overview</span>
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => handleTabChange('tools')}
          >
            <Wrench size={15} /> <span>Tools ({tools.length})</span>
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('requests')}
          >
            <Lightbulb size={15} /> <span>Requests ({requests.length || stats?.requests || 0})</span>
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'bugs' ? 'active' : ''}`}
            onClick={() => handleTabChange('bugs')}
          >
            <Bug size={15} /> <span>Bugs ({bugs.length || stats?.bugs || 0})</span>
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            <Mail size={15} /> <span>Messages ({messages.length || stats?.messages || 0})</span>
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
            onClick={() => handleTabChange('subscribers')}
          >
            <Users size={15} /> <span>Subscribers ({subscribers.length || stats?.subscribers || 0})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="modal-body" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Total Tools</div>
                  <div className="font-semibold text-2xl mt-1">{stats.tools}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Community Requests</div>
                  <div className="font-semibold text-2xl mt-1">{stats.requests}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Bug Reports</div>
                  <div className="font-semibold text-2xl mt-1">{stats.bugs}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Direct Messages</div>
                  <div className="font-semibold text-2xl mt-1">{stats.messages}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Launch Subscribers</div>
                  <div className="font-semibold text-2xl mt-1">{stats.subscribers}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="text-secondary text-xs">Registered Users</div>
                  <div className="font-semibold text-2xl mt-1">{stats.users}</div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px'
                }}
              >
                <h4 className="font-semibold text-base mb-2">Monolithic Platform Status</h4>
                <p className="text-secondary text-sm mb-4">
                  All developer tools are hosted across isolated subdomains or local routing on <code className="code-badge">abishek.in</code>.
                  Each tool supports direct community attribution, error logging, and high-performance server-side routing.
                </p>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary" onClick={openNewToolModal}>
                    <Plus size={15} /> Add New Tool
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => handleTabChange('requests')}>
                    Review Requests
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS */}
          {activeTab === 'tools' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">Registered Ecosystem Tools ({tools.length})</div>
                <button type="button" className="btn btn-primary" onClick={openNewToolModal}>
                  <Plus size={15} /> Add Tool
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tools.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      opacity: t.is_hidden ? 0.6 : 1
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="tool-icon-wrapper" style={{ width: '36px', height: '36px' }}>
                        <ToolIcon name={t.icon} size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{t.name}</span>
                          <span className="badge" style={{ fontSize: '0.7rem' }}>{t.category}</span>
                          {t.suggested_by && (
                            <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                              Requested by: {t.suggested_by}
                            </span>
                          )}
                          {Boolean(t.is_upcoming) && (
                            <span className="badge badge-upcoming" style={{ fontSize: '0.7rem' }}>
                              Upcoming
                            </span>
                          )}
                          {Boolean(t.is_hidden) && (
                            <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)' }}>
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="text-secondary text-xs truncate" style={{ maxWidth: '450px' }}>
                          {t.url} &bull; {t.short_desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost text-secondary"
                        style={{ padding: '6px' }}
                        title="Open App"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        type="button"
                        className="btn-ghost text-secondary"
                        style={{ padding: '6px' }}
                        title={t.is_hidden ? 'Make Visible' : 'Hide from Public'}
                        onClick={() => handleToggleHide(t.id)}
                      >
                        {t.is_hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-secondary"
                        style={{ padding: '6px' }}
                        title="Edit Tool"
                        onClick={() => openEditToolModal(t)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-error"
                        style={{ padding: '6px' }}
                        title="Delete Tool"
                        onClick={() => handleDeleteTool(t.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REQUESTS */}
          {activeTab === 'requests' && (
            <div>
              <div className="text-sm font-semibold mb-4">Community Feature & Tool Requests ({requests.length})</div>
              {requests.length === 0 ? (
                <div className="text-secondary text-sm">No requests found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '14px 18px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm">{r.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ fontSize: '0.72rem' }}>
                            {r.votes_count || 0} votes
                          </span>
                          <select
                            className="form-select"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'auto' }}
                            value={r.status || 'pending'}
                            onChange={(e) => handleUpdateRequestStatus(r.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="planned">Planned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed / Live</option>
                            <option value="declined">Declined</option>
                          </select>
                          <button
                            type="button"
                            className="btn-ghost text-error"
                            style={{ padding: '4px' }}
                            onClick={() => handleDeleteRequest(r.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-secondary text-xs mb-2">{r.description}</p>
                      <div className="flex items-center gap-4 text-muted text-xs">
                        <span>Requester: <strong className="text-primary">{r.name || 'Anonymous'}</strong> ({r.email || 'No email'})</span>
                        <span>Date: {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUGS */}
          {activeTab === 'bugs' && (
            <div>
              <div className="text-sm font-semibold mb-4">Bug Reports & Issues ({bugs.length})</div>
              {bugs.length === 0 ? (
                <div className="text-secondary text-sm">No bug reports submitted.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bugs.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '14px 18px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{b.title}</span>
                          <span className="badge" style={{ fontSize: '0.7rem' }}>{b.tool_name}</span>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.7rem',
                              background: b.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
                              color: b.severity === 'critical' ? 'var(--error)' : 'var(--text-secondary)'
                            }}
                          >
                            {b.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="form-select"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'auto' }}
                            value={b.status || 'open'}
                            onChange={(e) => handleUpdateBugStatus(b.id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button
                            type="button"
                            className="btn-ghost text-error"
                            style={{ padding: '4px' }}
                            onClick={() => handleDeleteBug(b.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-secondary text-xs mb-2">{b.description}</p>
                      {b.steps_to_reproduce && (
                        <div className="text-xs text-muted mb-2">
                          <strong>Steps:</strong> {b.steps_to_reproduce}
                        </div>
                      )}
                      <div className="text-muted text-xs">
                        Reported by: <strong>{b.email}</strong> &bull; {new Date(b.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              <div className="text-sm font-semibold mb-4">Direct Contact Messages ({messages.length})</div>
              {messages.length === 0 ? (
                <div className="text-secondary text-sm">No messages received yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '14px 18px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{m.subject}</span>
                        <button
                          type="button"
                          className="btn-ghost text-error"
                          style={{ padding: '4px' }}
                          onClick={() => handleDeleteMessage(m.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-secondary text-xs mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                        {m.message}
                      </p>
                      <div className="text-muted text-xs">
                        From: <strong>{m.name}</strong> ({m.email}) &bull; {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div>
              <div className="text-sm font-semibold mb-4">Launch Subscribers ({subscribers.length})</div>
              {subscribers.length === 0 ? (
                <div className="text-secondary text-sm">No subscribers yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {subscribers.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div>
                        <span className="font-medium">{s.email}</span>
                        <span className="text-muted text-xs ml-3">Target: <code className="code-badge">{s.tool_slug}</code></span>
                      </div>
                      <span className="text-muted text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ flexShrink: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Portal
          </button>
        </div>

        {/* Nested Add/Edit Tool Modal */}
        {toolModalOpen && (
          <div className="modal-overlay show" style={{ zIndex: 1100 }} onClick={() => setToolModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div className="modal-header" style={{ height: '60px', minHeight: '60px', flexShrink: 0 }}>
                <h3 className="modal-title">{editingTool ? 'Edit Tool' : 'Add New Tool to Ecosystem'}</h3>
                <button className="modal-close" onClick={() => setToolModalOpen(false)} type="button">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTool}>
                <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Tool Name <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. JSON Formatter & Validator"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Slug (URL identifier) <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. json"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        disabled={Boolean(editingTool)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>App URL <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="https://json.abishek.in or /apps/..."
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Icon Key</label>
                      <select
                        className="form-select"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      >
                        <option value="code">code</option>
                        <option value="terminal">terminal</option>
                        <option value="brackets">brackets</option>
                        <option value="file-text">file-text</option>
                        <option value="sparkles">sparkles</option>
                        <option value="image">image</option>
                        <option value="file">file</option>
                        <option value="video">video</option>
                        <option value="globe">globe</option>
                        <option value="target">target</option>
                        <option value="database">database</option>
                        <option value="palette">palette</option>
                        <option value="layers">layers</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="developer">Developer</option>
                        <option value="utilities">Utilities</option>
                        <option value="design">Design</option>
                        <option value="data">Data</option>
                        <option value="security">Security</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label>Badge Label</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Popular, New, Active..."
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Community Requester Attribute */}
                  <div className="form-group">
                    <label>Suggested By (Requester Profile Credit)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah Chen (@sarahc) or Community Request"
                      value={formData.suggested_by}
                      onChange={(e) => setFormData({ ...formData, suggested_by: e.target.value })}
                    />
                    <span className="text-muted text-xs mt-1 block">
                      Displays a prominent "Requested by" profile credit tag on the tool card.
                    </span>
                  </div>

                  <div className="form-group">
                    <label>Short Description <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Brief one-line description for the card"
                      value={formData.short_desc}
                      onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Key Features (comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Syntax highlighting, Schema validation, Minification"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Search Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="json, schema, format, beautify"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={formData.is_upcoming}
                        onChange={(e) => setFormData({ ...formData, is_upcoming: e.target.checked })}
                      />
                      <span>Mark as Upcoming in Roadmap</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={formData.is_hidden}
                        onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                      />
                      <span>Hide from Public Showcase</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setToolModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
