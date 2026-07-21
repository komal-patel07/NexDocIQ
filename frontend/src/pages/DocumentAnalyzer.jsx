import React, { useState, useRef } from 'react';
import { Upload, FileText, BarChart2, Plus, Sparkles, CheckCircle2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import './DocumentAnalyzer.css';

export default function DocumentAnalyzer({ documents, addDocument, activeDoc, setActiveDoc, setSubView }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Trigger file browser click
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mock document generator
  const createMockDocument = (fileName, fileSize) => {
    const isCsv = fileName.endsWith('.csv') || fileName.endsWith('.xlsx');
    const isJson = fileName.endsWith('.json');
    
    // Default mock contents
    let metadata = {
      words: Math.floor(fileSize / 6),
      readingTime: Math.max(1, Math.round(fileSize / 1500)),
      type: fileName.split('.').pop().toUpperCase(),
      size: `${(fileSize / 1024).toFixed(1)} KB`
    };

    let summary = '';
    let insights = [];
    let metrics = [];

    if (isCsv) {
      metadata.words = '-'; // rows/columns instead
      metadata.rows = Math.floor(fileSize / 80) + 12;
      metadata.cols = 7;
      summary = `Tabular dataset containing ${metadata.rows} rows and ${metadata.cols} columns. The data exhibits a structured pattern representing growth records, localized metrics, and performance deltas.`;
      insights = [
        "A clear positive trend in Q2 sales records, showing a 14.3% revenue jump.",
        "Identified 3 mild statistical anomalies in raw region-west rows.",
        "Enterprise category ranks highest in overall transaction volume."
      ];
      metrics = [
        { label: "Data Quality", val: 96, fill: "var(--accent-primary)" },
        { label: "Anomaly Rate", val: 4, fill: "#ff4d4d" },
        { label: "Growth Delta", val: 82, fill: "var(--accent-secondary)" }
      ];
    } else if (isJson) {
      summary = `JSON structure containing configuration mapping nodes. It covers API access boundaries, metadata parameters, client hooks, and environment secrets definitions.`;
      insights = [
        "Verified JSON compliance schema is 100% syntactically correct.",
        "Found 8 major environment parameter variables.",
        "Nested structural depth of 4 layers identified."
      ];
      metrics = [
        { label: "Schema Match", val: 100, fill: "var(--accent-primary)" },
        { label: "Integrity Index", val: 94, fill: "var(--accent-secondary)" },
        { label: "Complexity", val: 42, fill: "#ffaa00" }
      ];
    } else {
      // PDF/TXT reports
      summary = `Extracted executive report summarizing project milestones. It details key operational performance vectors, budget balances, and strategic milestones scheduled for subsequent quarters.`;
      insights = [
        "Primary narrative focuses on automation updates and scaling operations.",
        "Reading complexity corresponds to a collegiate readability score level.",
        "Positive sentiment detected in 82% of paragraphs, reflecting team growth."
      ];
      metrics = [
        { label: "Readability Score", val: 86, fill: "var(--accent-primary)" },
        { label: "Sentiment Index", val: 78, fill: "var(--accent-secondary)" },
        { label: "Information Density", val: 65, fill: "#3b82f6" }
      ];
    }

    return {
      id: Date.now().toString(),
      name: fileName,
      metadata,
      summary,
      insights,
      metrics,
      date: new Date().toISOString()
    };
  };

  // Handle uploaded files
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setProgress(0);

    // Simulate progress increments
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc = createMockDocument(file.name, file.size);
            addDocument(newDoc);
            setActiveDoc(newDoc);
            setUploading(false);
          }, 300);
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 15;
        return Math.min(100, old + step);
      });
    }, 200);
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-grid">
        
        {/* Left Side: Upload & List */}
        <div>
          {/* Upload Widget */}
          <div className="glass-panel upload-dropzone" onClick={handleDropzoneClick}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.csv,.xlsx,.txt,.json"
            />
            {uploading ? (
              <div className="upload-progress-wrapper">
                <div className="upload-progress-text">Analyzing file... {progress}%</div>
                <div className="widget-bar" style={{ maxWidth: '240px', margin: '0 auto' }}>
                  <div className="widget-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="upload-icon-wrap">
                  <Upload size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
                  Drop your report or data file here
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Supports PDF, CSV, Excel, TXT, JSON up to 10MB
                </p>
              </>
            )}
          </div>

          {/* List of documents */}
          <div className="glass-panel doc-list-panel">
            <h3>Uploaded Files ({documents.length})</h3>
            {documents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                <AlertCircle size={18} style={{ margin: '0 auto 8px', display: 'block' }} />
                No files uploaded yet.
              </div>
            ) : (
              <div className="doc-items">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`doc-item-row ${activeDoc?.id === doc.id ? 'active' : ''}`}
                    onClick={() => setActiveDoc(doc)}
                  >
                    <div className="doc-item-info">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activeDoc?.id === doc.id ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-meta">
                          {doc.metadata.type} &bull; {doc.metadata.size}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(doc.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Document Insights / Stats charts */}
        <div>
          {activeDoc ? (
            <div className="glass-panel analysis-detail-panel animate-fade-in" key={activeDoc.id}>
              
              <div className="analysis-header">
                <div>
                  <h3>Analysis Summary</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {activeDoc.name}
                  </p>
                </div>
                <button 
                  onClick={() => setSubView('chat')}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <span>Chat with File</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Gauges & charts */}
              <div className="metrics-section">
                
                {/* Circular styled Gauge Box */}
                <div className="metric-card-gauge">
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {activeDoc.metadata.rows ? 'Total Rows Count' : 'Reading Duration'}
                  </div>
                  <div className="metric-gauge-val">
                    {activeDoc.metadata.rows 
                      ? `${activeDoc.metadata.rows} Rows`
                      : `${activeDoc.metadata.readingTime} Min`
                    }
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {activeDoc.metadata.cols 
                      ? `Columns count: ${activeDoc.metadata.cols}`
                      : `Word count: ${activeDoc.metadata.words}`
                    }
                  </div>
                </div>

                {/* Vertical bars chart represent index */}
                <div className="metric-bar-chart">
                  {activeDoc.metrics.map((item, idx) => (
                    <div key={idx} className="bar-row">
                      <div className="bar-label">{item.label}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${item.val}%`, backgroundColor: item.fill }}></div>
                      </div>
                      <span style={{ width: '30px', textAlign: 'right', fontWeight: '600' }}>{item.val}%</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Summary paragraph box */}
              <div className="analysis-summary-box">
                <h4>Executive Digest</h4>
                <p>{activeDoc.summary}</p>
              </div>

              {/* Extracted points */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} className="text-accent" />
                  <span>Key Extracted Insights</span>
                </h4>
                
                <div className="insights-list">
                  {activeDoc.insights.map((insight, idx) => (
                    <div key={idx} className="insight-item">
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel empty-workspace-state" style={{ height: '500px', justifyContent: 'center' }}>
              <BarChart2 size={48} />
              <h3>Select a file to inspect metrics</h3>
              <p style={{ maxWidth: '280px', fontSize: '14px' }}>
                Upload files on the left side menu or select an existing document to review structural insights.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
