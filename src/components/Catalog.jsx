import React, { useState } from 'react';
import { Heart, Bell, ExternalLink, Copy, Check } from 'lucide-react';
import { ToolIcon, getInitials } from '../utils/icons';
import { useToast } from '../context/ToastContext';

export default function Catalog({
  tools,
  activeCategory,
  setActiveCategory,
  sortOption,
  setSortOption,
  onLikeTool,
  onOpenNotify,
  onOpenRequest
}) {
  const { showToast } = useToast();
  const [copiedSlug, setCopiedSlug] = useState(null);

  const categories = [
    { key: 'all', label: 'All Tools' },
    { key: 'developer', label: 'Developer' },
    { key: 'formatters', label: 'Formatters & Converters' },
    { key: 'media', label: 'Media & Documents' },
    { key: 'upcoming', label: 'Roadmap' }
  ];

  const getCategoryCount = (key) => {
    if (key === 'all') return tools.length;
    if (key === 'upcoming') return tools.filter(t => t.is_upcoming).length;
    return tools.filter(t => t.category === key).length;
  };

  const copyUrl = (url, slug, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      showToast(`Copied ${url} to clipboard`, 'success');
      setTimeout(() => setCopiedSlug(null), 2000);
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  return (
    <section className="catalog-section" id="catalogSection">
      <div className="section-container">
        <div className="catalog-nav-bar">
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label} (<span>{getCategoryCount(cat.key)}</span>)
              </button>
            ))}
          </div>

          <div className="catalog-meta">
            <span className="results-count-text">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
            </span>
            <div className="catalog-sort">
              <label htmlFor="sortSelect">Sort by:</label>
              <select
                id="sortSelect"
                className="select-input"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">Featured Order</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="tools-grid">
          {tools.length === 0 ? (
            <div className="grid-loading">
              <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No tools matching current criteria
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Have an idea for a tool that should be built?
              </p>
              <button className="btn btn-primary btn-sm" onClick={onOpenRequest}>
                <span>Request This Tool</span>
              </button>
            </div>
          ) : (
            tools.map(tool => {
              const isUpcoming = Boolean(tool.is_upcoming);
              let badgeClass = 'badge-live';
              if (isUpcoming) badgeClass = 'badge-upcoming';
              else if (tool.badge === 'Beta') badgeClass = 'badge-beta';
              else if (tool.badge === 'New') badgeClass = 'badge-new';

              const cleanDisplayUrl = tool.url.replace(/^https?:\/\//, '');
              const features = Array.isArray(tool.features) ? tool.features : [];

              return (
                <div key={tool.slug} className="tool-card">
                  <div className="tool-card-header">
                    <div className="tool-icon-box">
                      <ToolIcon name={tool.icon || tool.slug} size={26} />
                    </div>
                    <div className="tool-meta-block">
                      <div className="tool-title-row">
                        <h3 className="tool-title" title={tool.name}>{tool.name}</h3>
                        <span className={`tool-badge ${badgeClass}`}>{tool.badge || 'Live'}</span>
                      </div>
                      <div
                        className="tool-url-sub"
                        onClick={(e) => copyUrl(tool.url, tool.slug, e)}
                        title="Click to copy link"
                      >
                        <span>{cleanDisplayUrl}</span>
                        <button className="copy-mini-btn" title="Copy URL" type="button">
                          {copiedSlug === tool.slug ? <Check size={12} color="var(--success-text)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="tool-description">{tool.short_desc}</p>

                  {/* Community Requester Credit Badge */}
                  {tool.suggested_by && (
                    <div className="tool-requester-badge" title="Originally proposed as a community request">
                      <div className="requester-avatar">{getInitials(tool.suggested_by)}</div>
                      <div className="requester-info">
                        <span className="requester-subtext">Community Request</span>
                        <span className="requester-name">{tool.suggested_by}</span>
                      </div>
                    </div>
                  )}

                  <div className="tool-features-list">
                    {features.slice(0, 4).map((f, i) => (
                      <span key={i} className="feature-pill">{f}</span>
                    ))}
                  </div>

                  <div className="tool-card-footer">
                    <button
                      className="like-btn"
                      onClick={() => onLikeTool(tool.slug)}
                      title="Upvote this tool"
                      type="button"
                    >
                      <Heart size={14} />
                      <span className="like-count">{tool.likes_count || 0}</span>
                    </button>

                    {isUpcoming ? (
                      <button
                        className="notify-btn"
                        onClick={() => onOpenNotify(tool.slug, tool.name)}
                        type="button"
                      >
                        <Bell size={13} />
                        <span>Notify on Launch</span>
                      </button>
                    ) : (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="launch-btn"
                      >
                        <span>Open Tool</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
