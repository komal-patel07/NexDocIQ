import React from 'react';
import { Terminal, Cpu, ShieldCheck, Database, Layers, ArrowRight } from 'lucide-react';

export default function About({ setPage }) {
  return (
    <div className="container animate-fade-in" style={{ padding: '80px 24px' }}>
      
      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
        <span className="badge">Our Mission</span>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '20px' }} className="text-gradient">
          Explaining data. Empowering analysts.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          NexDocIQ was founded with a single goal: to remove the friction of understanding complex technical documents and raw text records.
        </p>
      </div>

      {/* Grid of details */}
      <div className="features-grid" style={{ marginBottom: '80px' }}>
        
        <div className="glass-panel glass-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(57, 204, 144, 0.08)',
            border: '1px solid var(--border-glass-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Cpu size={24} />
          </div>
          <h3>Advanced Semantic Engine</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            We map unstructured sentences, charts, and file logs into a tokenized context tree. This lets us fetch relevant cross-sections instantly during chat interactions.
          </p>
        </div>

        <div className="glass-panel glass-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(57, 204, 144, 0.08)',
            border: '1px solid var(--border-glass-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h3>Local Confidentiality</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            NexDocIQ values data privacy. All parsing algorithms run directly in your local browser sandbox, ensuring your files never leave your dashboard context.
          </p>
        </div>

        <div className="glass-panel glass-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(57, 204, 144, 0.08)',
            border: '1px solid var(--border-glass-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Layers size={24} />
          </div>
          <h3>Modular Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Seamlessly toggle between stats viewing (readability indices, word charts, summaries) and interactive context chat to find answers within seconds.
          </p>
        </div>

      </div>

      {/* Tech Architecture Section */}
      <div className="glass-panel" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-glow-orb" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>How NexDocIQ Works</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '700px' }}>
            From document upload to interactive conversational insights, here is the structured pipeline under the hood:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { step: '1', title: 'Upload & Mime Filter', desc: 'Select text files, spreadsheets, or PDF reports. Our analyzer verifies formatting structure.' },
              { step: '2', title: 'Semantic Chunking', desc: 'The document content is broken down into structured sections, keeping tables and statistical sections together.' },
              { step: '3', title: 'Context Indexation', desc: 'Important metrics (readability scores, core keywords, anomalies) are extracted and plotted in charts.' },
              { step: '4', title: 'Interactive Sandbox', desc: 'Engage with our context-aware assistant to query specific entries and isolate records.' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px' }}>
            <button onClick={() => setPage('feedback')} className="btn-primary">
              <span>Leave us feedback</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
