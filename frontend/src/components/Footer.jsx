import React from 'react';
import { Terminal } from 'lucide-react';

export default function Footer({ setPage }) {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }} className="logo">
              <Terminal size={24} className="logo-icon" />
              <span>Nex<span className="text-accent">DocIQ</span></span>
            </a>
            <p>
              Automated document insights, statistics mapping, and interactive chat. Transform how you explain and understand complex workflows.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Features</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Integrations</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Pricing</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Changelog</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Keep in touch</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Twitter</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>LinkedIn</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Discord</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Newsletter</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Help Center</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Guides</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>API Status</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Tutorials</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Privacy Policy</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Terms of Service</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Security</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} NexDocIQ. All rights reserved.</div>
          <div className="footer-bottom-links">
            <a href="#privacy">English</a>
            <a href="#terms">Japanese</a>
            <a href="#security">Spanish</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
