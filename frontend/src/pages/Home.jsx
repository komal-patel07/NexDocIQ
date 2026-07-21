import React from 'react';
import { ArrowRight, FileText, Database, Layers, Sparkles, BookOpen, GraduationCap, Store, Briefcase, User } from 'lucide-react';
import './Home.css';

export default function Home({ setPage, user, activePersona, onPersonaChange }) {
  
  const personas = [
    { id: 'student', label: 'Student', desc: 'Explains textbooks, assignments, and research in study-friendly terms.', icon: <GraduationCap size={24} /> },
    { id: 'shopkeeper', label: 'Shopkeeper', desc: 'Explains supplier invoices, monthly sales logs, and inventory lists.', icon: <Store size={24} /> },
    { id: 'business', label: 'Business Owner', desc: 'Explains contracts, ARR financial reports, and team proposals.', icon: <Briefcase size={24} /> },
    { id: 'general', label: 'General Public', desc: 'Explains utility bills, government letters, and simple everyday files.', icon: <User size={24} /> }
  ];

  const handlePersonaSelect = (id) => {
    onPersonaChange(id);
    if (user) {
      setPage('dashboard');
    } else {
      setPage('auth');
    }
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Background Orbs */}
      <div className="bg-glow-orb top-right"></div>
      <div className="bg-glow-orb bottom-left"></div>

      {/* Hero Section */}
      <section className="hero-sec" style={{ paddingBottom: '40px' }}>
        <div className="container hero-content">
          <span className="badge">
            <Sparkles size={14} style={{ marginRight: '6px' }} />
            Introducing NexDocIQ
          </span>
          <h1 className="hero-title text-gradient">
            A system for your work.<br />Not just a tool.
          </h1>
          <p className="hero-subtitle">
            Upload document files (PDF, CSV, or Text) and receive a plain-language explanation tailored to your day-to-day role. Avoid technical jargon instantly.
          </p>
        </div>
      </section>

      {/* Persona Selection Panel (Directly in Flow) */}
      <section style={{ padding: '20px 0 60px', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-glass)',
            borderRadius: '50px',
            padding: '12px 28px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}>
              <Sparkles size={16} className="text-accent" />
              <span>To begin, select your active Persona:</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {personas.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => handlePersonaSelect(p.id)}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: activePersona === p.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: activePersona === p.id ? 'rgba(57, 204, 144, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: activePersona === p.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  title={p.desc}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: activePersona === p.id ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {p.icon}
                  </span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scattered Tools Section */}
      <section className="stats-sec">
        <div className="container">
          <div className="stats-grid-desc">
            <h2 className="stats-title">
              Data is scattered across too many formats.
            </h2>
            <p className="stats-right-text">
              Reading through long files, analyzing raw charts, and manually finding answers wastes hours every day. NexDocIQ provides one central cockpit to upload documents, ask queries, and generate insights automatically.
            </p>
          </div>

          <div className="stats-counters">
            <div className="stat-counter-card">
              <div className="stat-number">35%</div>
              <div className="stat-label">Faster reading & digest</div>
            </div>
            <div className="stat-counter-card">
              <div className="stat-number">18+</div>
              <div className="stat-label">File formats supported</div>
            </div>
            <div className="stat-counter-card">
              <div className="stat-number">68%</div>
              <div className="stat-label">Higher clarity rating</div>
            </div>
            <div className="stat-counter-card">
              <div className="stat-number">1-3</div>
              <div className="stat-label">Hours saved daily per user</div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Work Solution Section */}
      <section className="unified-sec">
        <div className="container">
          <div className="unified-header">
            <h2 className="unified-title">Our unified data solution.</h2>
            <p className="unified-subtitle">Direct document parsing meeting interactive conversation.</p>
          </div>

          <div className="unified-grid">
            <div className="glass-panel solution-card">
              <div className="solution-visual">
                <div className="tool-network" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="tool-node active"><FileText size={20} /></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PDF</span>
                  <div className="tool-node active"><Database size={20} /></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CSV</span>
                  <div className="tool-node active"><Sparkles size={20} /></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TXT</span>
                </div>
              </div>
              <div>
                <h3>Centralize all data</h3>
                <p>Upload PDF, CSV, or TXT. Our parser handles complex tables, indexes headers, and prepares clean text mappings automatically.</p>
              </div>
            </div>

            <div className="glass-panel solution-card">
              <div className="solution-visual">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '80%' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600' }}>PARSER SUCCESS</div>
                    <div style={{ fontSize: '13px' }}>Spreadsheet mapped successfully.</div>
                  </div>
                  <div style={{ background: 'rgba(57, 204, 144, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass-active)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: '600' }}>SIMPLE SUMMARY</div>
                    <div style={{ fontSize: '13px' }}>Your sales increased this month by $20,000!</div>
                  </div>
                </div>
              </div>
              <div>
                <h3>Automate analysis</h3>
                <p>Run instant semantic search and statistical mapping. Get automatic chart breakdowns, main keypoints, and risk factors instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
