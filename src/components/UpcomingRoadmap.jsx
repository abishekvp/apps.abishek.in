import React from 'react';
import { Bell } from 'lucide-react';
import { ToolIcon, getInitials } from '../utils/icons';

export default function UpcomingRoadmap({ upcomingTools, onOpenNotify }) {
  if (upcomingTools.length === 0) return null;

  return (
    <section className="upcoming-section" id="upcomingSection">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">Roadmap</span>
          <h2 className="section-title">Upcoming Tools & Early Access</h2>
          <p className="section-desc">
            Tools currently in development. Subscribe with your email to receive an early access notification the moment they launch.
          </p>
        </div>

        <div className="upcoming-grid">
          {upcomingTools.map(tool => (
            <div key={tool.slug} className="upcoming-card">
              <div className="upcoming-card-header">
                <div className="upcoming-icon">
                  <ToolIcon name={tool.icon || tool.slug} size={22} />
                </div>
                <span className="launch-badge">{tool.launch_date || 'In Development'}</span>
              </div>

              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {tool.name}
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '14px', flex: 1 }}>
                {tool.short_desc}
              </p>

              {tool.suggested_by && (
                <div className="tool-requester-badge" style={{ marginBottom: '14px' }}>
                  <div className="requester-avatar">{getInitials(tool.suggested_by)}</div>
                  <div className="requester-info">
                    <span className="requester-subtext">Requested by</span>
                    <span className="requester-name">{tool.suggested_by}</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm w-full"
                onClick={() => onOpenNotify(tool.slug, tool.name)}
                type="button"
              >
                <Bell size={13} />
                <span>Notify on Launch</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
