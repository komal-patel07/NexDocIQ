import React from 'react';
import { Terminal, LogIn, LogOut, LayoutDashboard } from 'lucide-react';

export default function Header({ currentPage, setPage, user, handleLogout }) {
  return (
    <header className="app-header">
      <div className="container header-container">
        <a href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }} className="logo">
          <Terminal size={26} className="logo-icon" />
          <span>Nex<span className="text-accent">DocIQ</span></span>
        </a>

        <nav className="nav-links">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); setPage('home'); }}
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </a>
          {user && (
            <a
              href="#dashboard"
              onClick={(e) => { e.preventDefault(); setPage('dashboard'); }}
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </a>
          )}
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); setPage('about'); }}
            className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
          >
            About
          </a>
          <a
            href="#feedback"
            onClick={(e) => { e.preventDefault(); setPage('feedback'); }}
            className={`nav-link ${currentPage === 'feedback' ? 'active' : ''}`}
          >
            Feedback
          </a>
        </nav>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                onClick={() => setPage('dashboard')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {(user?.username || 'User').substring(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {user?.username || 'User'}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', gap: '6px' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setPage('auth')} 
                className="btn-secondary" 
                style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', gap: '6px' }}
              >
                <LogIn size={16} />
                <span>Log in</span>
              </button>
              <button 
                onClick={() => setPage('auth')} 
                className="btn-primary" 
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
