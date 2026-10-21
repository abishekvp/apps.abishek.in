import React, { useState, useEffect } from 'react';
import { Zap, Bug, Mail, Plus, User, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Header({ onOpenRequest, onOpenBug, onOpenContact, onOpenAuth, onOpenAccount, onOpenAdmin }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('hub_theme') || 'dark');
  const [subdomainText, setSubdomainText] = useState('apps.abishek.in · tools.abishek.in');

  useEffect(() => {
    const host = window.location.hostname;
    if (host.includes('tools.')) {
      setSubdomainText('tools.abishek.in · Developer Suite');
    } else if (host.includes('apps.')) {
      setSubdomainText('apps.abishek.in · Applications Directory');
    }
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
    localStorage.setItem('hub_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Theme`, 'info');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hub-header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" className="hub-brand">
            <div className="hub-brand-icon">
              <Zap size={20} />
            </div>
            <div className="hub-brand-meta">
              <span className="hub-brand-title">Abishek<span className="text-accent">Tools</span></span>
              <span className="hub-subdomain">{subdomainText}</span>
            </div>
          </a>

          <nav className="header-nav">
            <span onClick={() => scrollToSection('catalogSection')} className="header-nav-link">Tools</span>
            <span onClick={() => scrollToSection('upcomingSection')} className="header-nav-link">Roadmap</span>
            <span onClick={() => scrollToSection('requestsSection')} className="header-nav-link">Community Ideas</span>
          </nav>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={onOpenBug} title="Report an issue">
            <Bug size={14} />
            <span>Report Bug</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onOpenContact} title="Contact developer">
            <Mail size={14} />
            <span>Support</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={onOpenRequest}>
            <Plus size={14} />
            <span>Request Tool</span>
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentUser.role === 'admin' && (
                <a
                  href="/admin"
                  className="btn btn-sm btn-admin"
                  onClick={(e) => {
                    if (onOpenAdmin) {
                      e.preventDefault();
                      onOpenAdmin();
                    }
                  }}
                  title="Admin Portal"
                >
                  <Settings size={13} />
                  <span>Admin</span>
                </a>
              )}
              <button className="btn btn-secondary btn-sm" onClick={onOpenAccount}>
                <User size={13} />
                <span>{currentUser.name || currentUser.email.split('@')[0]}</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuth}>
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
