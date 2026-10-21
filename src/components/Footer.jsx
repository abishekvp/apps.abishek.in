import React from 'react';
import { Zap } from 'lucide-react';

export default function Footer({ onOpenRequest, onOpenBug, onOpenContact }) {
  return (
    <footer className="hub-footer">
      <div className="footer-container">
        <div className="footer-col">
          <div className="hub-brand">
            <div className="hub-brand-icon">
              <Zap size={18} />
            </div>
            <span className="hub-brand-title">Abishek Tools</span>
          </div>
          <p className="footer-text">
            Free, private, fullscreen web utilities for developers, designers, and creators worldwide. Built by Abishek V with focus on simplicity, speed, and privacy.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Developer Tools</h4>
          <ul className="footer-links">
            <li><a href="https://compiler.abishek.in" target="_blank" rel="noopener noreferrer">Web Compiler Studio</a></li>
            <li><a href="https://prettier.abishek.in" target="_blank" rel="noopener noreferrer">Prettier Code Formatter</a></li>
            <li><a href="https://md.abishek.in" target="_blank" rel="noopener noreferrer">Markdown Studio Pro</a></li>
            <li><a href="https://base64.abishek.in" target="_blank" rel="noopener noreferrer">Base64 Studio</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Data & Media</h4>
          <ul className="footer-links">
            <li><a href="https://json.abishek.in" target="_blank" rel="noopener noreferrer">JSON Master Suite</a></li>
            <li><a href="https://image.abishek.in" target="_blank" rel="noopener noreferrer">Image Compressor Pro</a></li>
            <li><a href="https://pdf.abishek.in" target="_blank" rel="noopener noreferrer">PDF Toolkit</a></li>
            <li><a href="https://youtube.abishek.in" target="_blank" rel="noopener noreferrer">YouTube Downloader</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Connect & Contribute</h4>
          <ul className="footer-links">
            <li><a href="#requestsSection" onClick={onOpenRequest}>Request New Tool</a></li>
            <li><a href="#catalogSection" onClick={onOpenBug}>Report a Bug</a></li>
            <li><a href="#catalogSection" onClick={onOpenContact}>Contact Developer</a></li>
            <li><a href="https://abishek.in" target="_blank" rel="noopener noreferrer">Abishek's Portfolio</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Abishek V · Hosted across apps.abishek.in & tools.abishek.in</span>
        <span>Clean, Private, Fast Web Utilities</span>
      </div>
    </footer>
  );
}
