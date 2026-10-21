import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, onSelectTag }) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      if (isK || isSlash) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
          searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const popularTags = [
    { label: 'base64', query: 'base64' },
    { label: 'format json', query: 'json' },
    { label: 'code compiler', query: 'compiler' },
    { label: 'markdown studio', query: 'markdown' },
    { label: 'prettier', query: 'prettier' },
    { label: 'compress image', query: 'image' },
    { label: 'pdf toolkit', query: 'pdf' }
  ];

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-pill">
          <span className="pill-dot"></span>
          <span>Developer Suite & Applications Hub · 100% Free & Private</span>
        </div>

        <h1 className="hero-heading">
          Every Developer & Productivity Tool<br />In One Clean Ecosystem
        </h1>

        <p className="hero-subtitle">
          High-performance fullscreen web applications running locally in your browser with zero latency, zero telemetry, and direct subdomain access.
        </p>

        {/* Search Bar at the Bottom of Hero Section */}
        <div className="search-container hero-search-bottom">
          <div className="search-input-box">
            <Search className="search-icon" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, action, or keyword (e.g. 'base64', 'format json', 'compiler', 'image compress')..."
              autoComplete="off"
            />
            <span className="search-kbd">Ctrl K</span>
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="search-tags-row">
            <span className="search-tag-label">Popular queries:</span>
            {popularTags.map(tag => (
              <button
                key={tag.query}
                className="search-tag"
                onClick={() => onSelectTag(tag.query)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
