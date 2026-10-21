import React from 'react';
import { Lightbulb, Plus, ArrowUp, Check } from 'lucide-react';
import { getInitials } from '../utils/icons';

export default function CommunitySection({ requests, onOpenRequest, onVoteRequest, liveTools }) {
  const scrollToCatalog = () => {
    const el = document.getElementById('catalogSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="requests-board-section" id="requestsSection">
      <div className="section-container">
        {/* Community Spotlight Banner */}
        <div className="community-highlight-banner">
          <div className="community-banner-content">
            <div className="community-badge-tag">
              <Lightbulb size={14} />
              <span>Community-Driven Roadmap</span>
            </div>
            <h2 className="community-banner-title">Every Tool Here Starts as a User Request</h2>
            <p className="community-banner-desc">
              Have an idea for a developer utility, formatter, or productivity app? Submit your request below. Once built and published into production, your name and profile are permanently featured on the tool card.
            </p>
            <div className="community-banner-actions">
              <button className="btn btn-primary" onClick={onOpenRequest}>
                <Plus size={14} />
                <span>Submit a Tool Idea</span>
              </button>
              <button className="btn btn-secondary" onClick={scrollToCatalog}>
                <span>View Published Tools</span>
              </button>
            </div>
          </div>

          <div className="community-stats-strip">
            <div className="stat-box">
              <span className="stat-number">100%</span>
              <span className="stat-label">Community Driven & Free</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">Permanent</span>
              <span className="stat-label">Requester Credit on Tool</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">Active</span>
              <span className="stat-label">Fast Engineering Pipeline</span>
            </div>
          </div>
        </div>

        {/* Board Header */}
        <div className="board-header">
          <div>
            <span className="section-badge">Community Backlog</span>
            <h2 className="section-title">Tool Requests & Ideas Backlog</h2>
            <p className="section-desc">Upvote community requests to prioritize what gets built next.</p>
          </div>
          <button className="btn btn-primary" onClick={onOpenRequest}>
            <Plus size={14} />
            <span>Submit New Tool Idea</span>
          </button>
        </div>

        {/* Requests Grid */}
        <div className="requests-grid">
          {requests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '32px 0' }}>
              No community requests yet. Be the first to suggest a tool idea!
            </div>
          ) : (
            requests.map(req => {
              const requesterName = req.name || (req.email ? req.email.split('@')[0] : 'Community Member');
              const requesterInitials = getInitials(requesterName);
              const statusClass = `status-${req.status || 'pending'}`;
              const isLaunched = req.status === 'launched';

              const matchingTool = liveTools.find(t =>
                t.name.toLowerCase().includes(req.title.toLowerCase()) ||
                req.title.toLowerCase().includes(t.name.toLowerCase())
              );

              return (
                <div key={req.id} className="request-card">
                  <div className="request-profile-row">
                    <div className="requester-profile-group">
                      <div className="requester-profile-avatar">{requesterInitials}</div>
                      <div className="requester-profile-meta">
                        <span className="requester-profile-name">{requesterName}</span>
                        <span className="requester-profile-sub">Community Requester</span>
                      </div>
                    </div>
                    <span className={`req-status-badge ${statusClass}`}>
                      {(req.status || 'pending').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="request-card-header">
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {req.title}
                    </h4>
                    <button
                      className="vote-btn"
                      onClick={() => onVoteRequest(req.id)}
                      title="Upvote this idea"
                      type="button"
                    >
                      <ArrowUp size={14} />
                      <span className="vote-count">{req.votes_count || 1}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '12px', flex: 1 }}>
                    {req.description}
                  </p>

                  {req.use_cases && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginBottom: '8px' }}>
                      <strong>Use Cases:</strong> {req.use_cases}
                    </div>
                  )}

                  {isLaunched && (
                    <a
                      href={matchingTool ? matchingTool.url : '#catalogSection'}
                      target={matchingTool ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="launched-link-pill"
                    >
                      <Check size={13} />
                      <span>Built & Live in Ecosystem</span>
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
