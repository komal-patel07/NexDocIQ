import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, ChevronDown, Settings, HelpCircle, Send, Sparkles, Plus, 
  Paperclip, Mic, ArrowUpRight, LayoutDashboard, Terminal, MessageSquare, 
  Users, Target, DollarSign, Calendar, Mail, Compass, FileText, Upload, LogOut, Check, Download, AlertCircle
} from 'lucide-react';
import './Dashboard.css';

const API_BASE = "http://localhost:5000/api";

const defaultDocs = [
  { id: "default-1", name: "demo_sales_data.csv", type: "CSV", size: "1.5 KB" }
];

const mockAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
];

export default function Dashboard({ user, persona, onPersonaChange }) {
  const [activeView, setActiveView] = useState('analyzer'); // analyzer | chat
  const [documents, setDocuments] = useState(defaultDocs);
  const [activeDoc, setActiveDoc] = useState(defaultDocs[0]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Profile settings
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('explainer_avatar') || mockAvatars[0]);

  // Chat settings
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am **NexDocIQ AI**. Choose one of the suggested prompts or type your document questions below, and I will explain them back in simple terms!",
      date: new Date().toISOString()
    }
  ]);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const getSidebarTrends = () => {
    if (stats && stats.sidebarTrends && Array.isArray(stats.sidebarTrends)) {
      return stats.sidebarTrends;
    }
    
    switch (persona) {
      case 'student':
        return [
          "⏱️ Reading ease holds at optimal 82% rate",
          "🎓 Memory retention index matches grade 10",
          "📚 Simplified analogies mapped for academic focus"
        ];
      case 'shopkeeper':
        return [
          "📈 Monthly transaction volumes grew by 18%",
          "🚨 Low stock items alert: 5 products below threshold",
          "💳 Sales credit conversion rate stands at 72%"
        ];
      case 'business':
        return [
          "📈 Pipeline health currently sits at 82% index",
          "🎯 Q2 enterprise deals won counts stand at 148",
          "⏱️ Overall forecasting accuracy scored at 96%"
        ];
      default:
        return [
          "📈 Overall subscription revenue expanded by 14.3%",
          "⏱️ Tone of document is scored 76% positive",
          "📚 No vocabulary spikes or complex jargon detected"
        ];
    }
  };

  // Fetch stats from backend Express API based on activeDoc ID and persona settings
  const fetchStats = async (docId, activePersona) => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats?fileId=${docId}&persona=${activePersona}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error("Failed to load stats");
      }
    } catch (err) {
      console.error("Dashboard stats fetch error, loading client mock fallback:", err);
      // Fallback
      if (docId === 'default-2' || (docId && docId.toLowerCase().includes('.pdf'))) {
        setStats(getMockPdfStats(activePersona));
      } else {
        setStats(getMockCsvStats(activePersona));
      }
    }
  };

  const fetchUserDocuments = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`${API_BASE}/documents?userId=${user.id}`);
      if (response.ok) {
        const userDocs = await response.json();
        setDocuments(userDocs);
        if (userDocs.length > 0) {
          setActiveDoc(userDocs[0]);
        } else {
          setActiveDoc(null);
        }
      } else {
        throw new Error("Failed to fetch documents");
      }
    } catch (err) {
      console.error("Error fetching user documents, falling back to local demo doc:", err);
      setDocuments(defaultDocs);
      setActiveDoc(defaultDocs[0]);
    }
  };

  const initiateDeleteDocument = (doc) => {
    setDeleteConfirmDoc(doc);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmDoc) return;
    const docId = deleteConfirmDoc.id;

    try {
      // If it's a default frontend fallback document, just filter it out locally
      if (docId.startsWith('default-')) {
        const updated = documents.filter(d => d.id !== docId);
        setDocuments(updated);
        if (activeDoc && activeDoc.id === docId) {
          setActiveDoc(updated.length > 0 ? updated[0] : null);
        }
        setDeleteConfirmDoc(null);
        return;
      }

      // API delete request
      const response = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updated = documents.filter(d => d.id !== docId);
        setDocuments(updated);
        if (activeDoc && activeDoc.id === docId) {
          setActiveDoc(updated.length > 0 ? updated[0] : null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }
    } catch (err) {
      console.error("Delete document failed, filtering locally:", err);
      const updated = documents.filter(d => d.id !== docId);
      setDocuments(updated);
      if (activeDoc && activeDoc.id === docId) {
        setActiveDoc(updated.length > 0 ? updated[0] : null);
      }
    } finally {
      setDeleteConfirmDoc(null);
    }
  };

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  useEffect(() => {
    if (activeDoc) {
      fetchStats(activeDoc.id, persona);
    }
  }, [activeDoc, persona]);

  // Scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isThinking]);

  // Load chat history for the active document on change or load
  useEffect(() => {
    const userId = user?.id || 'guest';
    const docId = activeDoc ? activeDoc.id : 'global';
    const key = `nexdociq_chat_${userId}_${docId}`;
    const savedChat = localStorage.getItem(key);
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    } else {
      setChatMessages([
        {
          sender: 'ai',
          text: "Hello! I am **NexDocIQ AI**. Choose one of the suggested prompts or type your document questions below, and I will explain them back in simple terms!",
          date: new Date().toISOString()
        }
      ]);
    }
  }, [activeDoc, user]);

  // Save chat history for the active document whenever messages change
  useEffect(() => {
    const userId = user?.id || 'guest';
    const docId = activeDoc ? activeDoc.id : 'global';
    const key = `nexdociq_chat_${userId}_${docId}`;
    if (chatMessages && chatMessages.length > 0) {
      localStorage.setItem(key, JSON.stringify(chatMessages));
    }
  }, [chatMessages, activeDoc, user]);

  // File uploading simulator
  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user ? user.id : '');

      setUploadProgress(40);
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(80);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const newDoc = await response.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDoc(newDoc);
        setUploading(false);
      }, 500);
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload file: " + err.message);
      setUploading(false);
    }
  };

  // Submit AI Copilot chat dialogue
  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      date: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend, 
          persona: persona,
          fileId: activeDoc ? activeDoc.id : null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setChatMessages(prev => [...prev, data]);
    } catch (err) {
      console.error("Chat API error, rendering local fallback:", err);
      setTimeout(() => {
        let replyText = '';
        if (persona === 'student') {
          replyText = "Think of this like a school class: it lists the math growth points, which is up 12%!";
        } else if (persona === 'shopkeeper') {
          replyText = "Regarding our wholesale ledger tab: we completed 148 customer balance payments successfully!";
        } else {
          replyText = "Welcome! I have processed the file contents. Ask me anything, and I'll explain it without using complex words!";
        }
        setChatMessages(prev => [...prev, {
          sender: 'ai',
          text: replyText,
          date: new Date().toISOString()
        }]);
      }, 1000);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAvatarChange = (url) => {
    setProfilePic(url);
    localStorage.setItem('explainer_avatar', url);
    setShowProfileModal(false);
  };

  const handleDownloadSummary = () => {
    if (!stats || !stats.summary) {
      alert("No summary available to download yet. Please wait for the document analysis to complete.");
      return;
    }
    const fileName = activeDoc ? `${activeDoc.name.split('.')[0]}_summary.txt` : "summary.txt";
    const cleanText = stats.summary.replace(/\*\*|__/g, "");
    
    const element = document.createElement("a");
    const file = new Blob([cleanText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const parseInlineMarkdown = (text) => {
    if (!text) return "";
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} style={{ color: 'var(--dash-accent)', fontWeight: '700' }}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const renderMsgText = (text) => {
    if (!text) return "";
    
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;
      
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={pIdx} style={{ fontSize: '15px', fontWeight: '700', color: 'var(--dash-accent)', marginTop: '16px', marginBottom: '8px' }}>
            {parseInlineMarkdown(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={pIdx} style={{ fontSize: '16px', fontWeight: '750', color: 'var(--dash-accent)', marginTop: '20px', marginBottom: '10px' }}>
            {parseInlineMarkdown(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={pIdx} style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dash-accent)', marginTop: '24px', marginBottom: '12px' }}>
            {parseInlineMarkdown(trimmed.substring(2))}
          </h2>
        );
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split(/\n[-*]\s+/);
        return (
          <ul key={pIdx} style={{ paddingLeft: '20px', margin: '8px 0', listStyleType: 'disc' }}>
            {items.map((item, iIdx) => {
              let cleanItem = item;
              if (iIdx === 0) {
                cleanItem = item.substring(2);
              }
              return (
                <li key={iIdx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  {parseInlineMarkdown(cleanItem)}
                </li>
              );
            })}
          </ul>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split(/\n\d+\.\s+/);
        return (
          <ol key={pIdx} style={{ paddingLeft: '20px', margin: '8px 0' }}>
            {items.map((item, iIdx) => {
              let cleanItem = item;
              if (iIdx === 0) {
                cleanItem = item.replace(/^\d+\.\s+/, "");
              }
              return (
                <li key={iIdx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  {parseInlineMarkdown(cleanItem)}
                </li>
              );
            })}
          </ol>
        );
      }
      
      const lines = trimmed.split('\n');
      return (
        <p key={pIdx} style={{ marginBottom: '12px', lineHeight: '1.6' }}>
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {lIdx > 0 && <br />}
              {parseInlineMarkdown(line)}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  const getPersonaLabel = (id) => {
    switch (id) {
      case 'student': return 'Student 🎓';
      case 'shopkeeper': return 'Shopkeeper 🏪';
      case 'business': return 'Business Owner 💼';
      default: return 'General Public 👤';
    }
  };

  return (
    <div className="nexus-dashboard">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="nexus-sidebar">
        <div className="nexus-logo-row">
          <div className="nexus-logo">
            <Terminal size={22} className="nexus-logo-icon" />
            <span>NexDocIQ</span>
          </div>
        </div>

        {/* Persona Switcher panel */}
        <div className="persona-switcher-box">
          <span className="persona-switcher-title">ACTIVE PERSONA</span>
          <select 
            value={persona} 
            onChange={(e) => onPersonaChange(e.target.value)}
            className="persona-select-element"
          >
            <option value="general">General Public 👤</option>
            <option value="student">Student 🎓</option>
            <option value="shopkeeper">Shopkeeper 🏪</option>
            <option value="business">Business Owner 💼</option>
          </select>
        </div>

        <div className="nexus-section-title">Active workspace</div>
        <div className="persona-switcher-box" style={{ padding: '8px' }}>
          <span className="persona-switcher-title" style={{ fontSize: '9px' }}>SELECT FILE</span>
          <select
            value={activeDoc ? activeDoc.id : ''}
            onChange={(e) => setActiveDoc(documents.find(d => d.id === e.target.value))}
            className="persona-select-element"
            style={{ fontSize: '12px' }}
          >
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".pdf,.docx,.csv,.xml"
          />
          <div className="sidebar-upload-trigger" onClick={handleUploadClick}>
            {uploading ? `Uploading ${uploadProgress}%` : (
              <>
                <Upload size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                <span>Upload Document</span>
              </>
            )}
          </div>
        </div>

        <div className="nexus-section-title">Navigation</div>
        <nav className="nexus-nav-list">
          <div 
            className={`nexus-nav-item ${activeView === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveView('analyzer')}
          >
            <span className="nexus-nav-label">
              <LayoutDashboard size={16} />
              <span>Document Analyzer</span>
            </span>
          </div>
          <div 
            className={`nexus-nav-item ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            <span className="nexus-nav-label">
              <MessageSquare size={16} />
              <span>Chat Assistant</span>
            </span>
          </div>
          <div 
            className="nexus-nav-item"
            onClick={handleDownloadSummary}
            style={{ 
              cursor: (stats && stats.summary) ? 'pointer' : 'not-allowed',
              opacity: (stats && stats.summary) ? 1 : 0.5
            }}
            title={(stats && stats.summary) ? "Download Plain Language Summary" : "No summary available to download"}
          >
            <span className="nexus-nav-label">
              <Download size={16} />
              <span>Download Summary</span>
            </span>
          </div>
        </nav>

        {/* Footer Profile with edit pop-up trigger */}
        <div className="nexus-user-footer">
          <div 
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowProfileModal(true)}
            title="Edit profile picture"
          >
            <img src={profilePic} alt="User profile avatar" className="nexus-avatar-img" />
            <div className="nexus-user-details">
              <div className="nexus-user-name">{user ? user.username : "Naruka Sado"}</div>
              <div className="nexus-user-role">{getPersonaLabel(persona)}</div>
            </div>
          </div>
          <Settings 
            size={15} 
            style={{ color: 'var(--dash-text-secondary)', cursor: 'pointer' }} 
            onClick={() => setShowProfileModal(true)}
          />
        </div>
      </aside>

      {/* 2. Main content panels (Conditional view router) */}
      <main className="nexus-main-panel">
        
        {/* Header */}
        <div className="nexus-top-header">
          <div className="nexus-sync-info">
            <h2>{activeDoc ? activeDoc.name : 'Analyzer Dashboard'}</h2>
            <p>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--dash-accent)', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Active Persona: {getPersonaLabel(persona)}</span>
            </p>
          </div>
          
          <div className="nexus-header-right">
            <div 
              className="nexus-member-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => setShowProfileModal(true)}
              title="Edit Profile"
            >
              <img src={profilePic} alt="Naruka Sado avatar" className="nexus-avatar-img" />
              <div>
                <div className="nexus-user-name">{user ? user.username : "Naruka Sado"}</div>
                <div className="nexus-user-role">Workspace Analyst</div>
              </div>
            </div>
          </div>
        </div>

        {/* View switching logic */}
        {activeView === 'analyzer' ? (
          /* View A: Document Analyzer Cockpit (including stats charts, curves, and summaries) */
          stats ? (
            <div className="nexus-dashboard-grid animate-fade-in">
              
              {/* Top row metric cards */}
              <div className="nexus-metrics-row">
                <div className="nexus-metric-card">
                  <div className="nexus-metric-header">
                    <DollarSign size={14} />
                    <span>{stats.primaryLabel}</span>
                  </div>
                  <div className="nexus-metric-val">{stats.primaryMetric}</div>
                  <span className="nexus-metric-trend">{stats.primarySubtext}</span>
                </div>

                <div className="nexus-metric-card">
                  <div className="nexus-metric-header">
                    <FileText size={14} />
                    <span>{stats.secLabel}</span>
                  </div>
                  <div className="nexus-metric-val">{stats.secMetric}</div>
                  <span className="nexus-metric-trend">{stats.secSubtext}</span>
                </div>

                <div className="nexus-metric-card">
                  <div className="nexus-metric-header">
                    <Target size={14} />
                    <span>{stats.thirdLabel}</span>
                  </div>
                  <div className="nexus-metric-val">{stats.thirdMetric}</div>
                  <span className="nexus-metric-trend">{stats.thirdSubtext}</span>
                </div>

                <div className="nexus-metric-card">
                  <div className="nexus-metric-header">
                    <Compass size={14} />
                    <span>{stats.fourthLabel}</span>
                  </div>
                  <div className="nexus-metric-val">{stats.fourthMetric}</div>
                  <span className="nexus-metric-trend">{stats.fourthSubtext}</span>
                </div>
              </div>

              {/* Curve chart */}
              <div className="nexus-chart-card">
                <div className="nexus-chart-header">
                  <h3>{stats.isTabular ? 'Sales Revenue Growth' : 'Document Comprehension & Readability curve'}</h3>
                  <div className="nexus-chart-filters">
                    <span className="nexus-chart-filter-item">Section</span>
                    <span className="nexus-chart-filter-item active">Chapter</span>
                    <span className="nexus-chart-filter-item">Volume</span>
                  </div>
                </div>

                <div className="nexus-svg-container">
                  <svg viewBox="0 0 600 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
                    <line x1="50" y1="20" x2="550" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <line x1="50" y1="60" x2="550" y2="60" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <line x1="50" y1="100" x2="550" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <line x1="50" y1="140" x2="550" y2="140" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <line x1="50" y1="170" x2="550" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

                    <text x="15" y="24" fill="var(--dash-text-muted)" fontSize="9">{stats.isTabular ? '800K' : '100%'}</text>
                    <text x="15" y="64" fill="var(--dash-text-muted)" fontSize="9">{stats.isTabular ? '600K' : '75%'}</text>
                    <text x="15" y="104" fill="var(--dash-text-muted)" fontSize="9">{stats.isTabular ? '400K' : '50%'}</text>
                    <text x="15" y="144" fill="var(--dash-text-muted)" fontSize="9">{stats.isTabular ? '200K' : '25%'}</text>
                    <text x="25" y="174" fill="var(--dash-text-muted)" fontSize="9">0</text>

                    {stats.chartLabels.map((lbl, idx) => (
                      <text key={idx} x={50 + idx * 83} y="194" fill="var(--dash-text-secondary)" fontSize="10" textAnchor="middle">{lbl}</text>
                    ))}

                    <path 
                      d={stats.isTabular 
                        ? "M 50 110 C 90 95, 90 95, 133 80 C 176 50, 176 40, 216 30 C 256 20, 265 105, 300 110 C 335 115, 350 90, 383 100 C 416 110, 426 70, 466 75 C 506 80, 506 80, 550 78" 
                        : "M 50 44 C 93 52, 133 68, 176 80 C 219 92, 260 76, 300 68 C 340 60, 383 52, 426 44 C 466 36, 506 40, 550 42"
                      }
                      fill="none" stroke="var(--dash-accent)" strokeWidth="3.5" strokeLinecap="round"
                    />
                    <path 
                      d={stats.isTabular 
                        ? "M 50 140 C 90 130, 90 120, 133 125 C 176 130, 176 110, 216 100 C 256 90, 260 70, 300 68 C 340 66, 350 128, 383 120 C 416 112, 426 102, 466 100 C 506 98, 506 98, 550 96"
                        : "M 50 100 C 93 80, 133 60, 176 58 C 219 56, 260 80, 300 90 C 340 100, 383 92, 426 84 C 466 76, 506 72, 550 68"
                      }
                      fill="none" stroke="var(--dash-accent-orange)" strokeWidth="3.5" strokeLinecap="round"
                    />
                    
                    <circle cx="300" cy={stats.isTabular ? 110 : 68} r="5" fill="var(--dash-accent)" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="300" cy={stats.isTabular ? 68 : 90} r="5" fill="var(--dash-accent-orange)" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  <div className="nexus-chart-tooltip" style={{ top: '15px', left: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--dash-accent)', display: 'inline-block' }}></span>
                      <span>
                        {stats.indicators && Object.values(stats.indicators)[0] 
                          ? `${Object.values(stats.indicators)[0].title}: ${Object.values(stats.indicators)[0].value}`
                          : (stats.isTabular ? '$148,200' : '82% Reading ease')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--dash-accent-orange)', display: 'inline-block' }}></span>
                      <span>
                        {stats.indicators && Object.values(stats.indicators)[1] 
                          ? `${Object.values(stats.indicators)[1].title}: ${Object.values(stats.indicators)[1].value}`
                          : (stats.isTabular ? '$548,300' : '60% Density')}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'bold', margin: '4px 0 2px' }}>
                      {stats.primaryLabel ? `${stats.primaryLabel}: ${stats.primaryMetric}` : (stats.isTabular ? '$6.9M Volume' : 'Optimized range')}
                    </div>
                    <div style={{ color: 'var(--dash-text-muted)', fontSize: '9px' }}>Current Document Reference</div>
                  </div>
                </div>
              </div>

              {/* Plain-Language Summary Box Card (PRD Feature) */}
              <div className="nexus-metric-card" style={{ padding: '24px', background: 'rgba(57, 204, 144, 0.03)', borderColor: 'var(--dash-border-active)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--dash-accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  <span>Plain Language Explanation Summary</span>
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--dash-text-secondary)' }}>
                  {stats.summary ? renderMsgText(stats.summary) : "Simplifying file parameters..."}
                </p>
              </div>

              {/* Indicators Row */}
              <div className="nexus-indicators-row">
                {Object.values(stats.indicators).map((ind, i) => (
                  <div key={i} className="nexus-indicator-card">
                    <div className="nexus-indicator-header">
                      <h4>{ind.title}</h4>
                      <p>{ind.desc}</p>
                    </div>
                    <div className="nexus-indicator-val">{ind.value}</div>
                    
                    <div className="nexus-bar-graph-visual">
                      {ind.bars.map((height, idx) => (
                        <div 
                          key={idx} 
                          className="nexus-bar-pillar" 
                          style={{ 
                            height: `${height}%`,
                            backgroundColor: idx === ind.bars.length - 1 ? ind.color : 'rgba(255,255,255,0.03)'
                          }}
                        ></div>
                      ))}
                    </div>

                    <div className="nexus-indicator-footer">
                      <span>{ind.total}</span>
                      <span style={{ color: ind.color, fontWeight: 'bold' }}>{ind.flagged}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Uploaded Files Table List */}
              <div className="nexus-table-card animate-fade-in">
                <div className="nexus-table-header">
                  <h3>Uploaded Workspace Files</h3>
                  <div className="nexus-sync-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dash-text-secondary)' }}>
                    <span>{documents.length} Files Available</span>
                  </div>
                </div>

                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Format</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} style={{ background: activeDoc && activeDoc.id === doc.id ? 'rgba(57, 204, 144, 0.04)' : 'transparent' }}>
                        <td>
                          <div className="nexus-client-cell">
                            <div className="file-icon-avatar" style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              background: 'var(--accent-muted)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justify: 'center',
                              fontWeight: 'bold',
                              color: 'var(--dash-accent)',
                              fontSize: '11px'
                            }}>
                              {doc.type}
                            </div>
                            <div style={{ marginLeft: '10px' }}>
                              <div className="nexus-user-name" style={{ fontSize: '13px', fontWeight: '500' }}>{doc.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--dash-text-secondary)' }}>{doc.type}</td>
                        <td style={{ color: 'var(--dash-text-secondary)' }}>{doc.size}</td>
                        <td>
                          {activeDoc && activeDoc.id === doc.id ? (
                            <span className="nexus-status-pill completed" style={{ background: 'rgba(57, 204, 144, 0.1)', color: 'var(--dash-accent)' }}>Active Workspace</span>
                          ) : (
                            <span className="nexus-status-pill pending" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--dash-text-secondary)' }}>Available</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {activeDoc && activeDoc.id === doc.id ? (
                              <span style={{ fontSize: '12px', color: 'var(--dash-accent)', fontWeight: 'bold', minWidth: '70px' }}>Analyzing</span>
                            ) : (
                              <button 
                                onClick={() => setActiveDoc(doc)}
                                className="nexus-view-all-btn"
                                style={{ 
                                  padding: '4px 12px', 
                                  fontSize: '11px', 
                                  border: '1px solid var(--dash-border)',
                                  borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.02)',
                                  color: 'var(--dash-text-secondary)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                Analyze
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); initiateDeleteDocument(doc); }}
                              className="nexus-delete-btn"
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '11px', 
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                borderRadius: '4px',
                                background: 'rgba(255, 77, 77, 0.05)',
                                color: '#ff4d4d',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Delete file"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--dash-text-secondary)' }}>
              Loading document metrics...
            </div>
          )
        ) : (
          /* View B: Full Chat Assistant workspace */
          <div className="nexus-dashboard-grid animate-fade-in" style={{ padding: '30px' }}>
            <div className="nexus-table-card" style={{ display: 'flex', flexDirection: 'column', height: '560px', padding: '0' }}>
              <div className="nexus-chat-header" style={{ padding: '20px 24px' }}>
                <h4 style={{ fontSize: '15px' }}>
                  <MessageSquare size={18} style={{ color: 'var(--dash-accent)', marginRight: '8px' }} />
                  <span>Q&A Chat Assistant Session</span>
                </h4>
                <span style={{ fontSize: '12px', background: 'var(--accent-muted)', padding: '4px 10px', borderRadius: '10px', color: 'var(--dash-accent)' }}>
                  Active Persona: {getPersonaLabel(persona)}
                </span>
              </div>
              
              {/* Chat Scroll Feed */}
              <div className="nexus-chat-scroll" style={{ padding: '24px', gap: '16px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`nexus-msg-bubble ${msg.sender}`} style={{ maxWidth: '75%', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--dash-text-muted)', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>{msg.sender === 'ai' ? 'EXPLAINER AI' : 'USER'}</span>
                    </div>
                    <div>
                      {renderMsgText(msg.text)}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="nexus-msg-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--dash-accent)' }}>Simplifying language vectors...</span>
                  </div>
                )}
                <div ref={scrollRef}></div>
              </div>

              {/* Chat Input row */}
              <div className="nexus-chat-input-row" style={{ padding: '16px 24px' }}>
                <Paperclip size={18} style={{ color: 'var(--dash-text-secondary)', marginRight: '10px', cursor: 'pointer' }} />
                <input 
                  type="text" 
                  className="nexus-chat-input"
                  style={{ padding: '12px 18px' }}
                  placeholder={`Ask a question about ${activeDoc ? activeDoc.name : 'your data'}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage(inputText);
                  }}
                />
                <button 
                  onClick={() => handleSendMessage(inputText)} 
                  className="nexus-chat-btn" 
                  style={{ width: '40px', height: '40px', marginLeft: '10px' }}
                  disabled={!inputText.trim() || isThinking}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Right Side Copilot Panel */}
      {activeView === 'analyzer' && (
        <aside className="nexus-right-panel">
          
          {/* Greetings & Insights */}
          <div className="nexus-bulletin-card">
            <div className="nexus-bulletin-header">
              <h4>Welcome Analyst 👋</h4>
              <span className="nexus-bulletin-badge">Live</span>
            </div>
            <div className="nexus-bulletin-list" style={{ marginBottom: '16px' }}>
              <div className="nexus-bulletin-item">
                <span className="nexus-bulletin-bullet">👤</span>
                <p>Active persona: <strong>{getPersonaLabel(persona)}</strong></p>
              </div>
              <div className="nexus-bulletin-item">
                <span className="nexus-bulletin-bullet">📄</span>
                <p>Selected file: <strong>{activeDoc ? activeDoc.name : 'None'}</strong></p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--dash-border)', paddingTop: '14px', marginTop: '10px' }}>
              <h5 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--dash-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} />
                <span>Overall Analysis Trends</span>
              </h5>
              <div className="nexus-bulletin-list">
                {getSidebarTrends().map((trend, index) => (
                  <div key={index} className="nexus-bulletin-item" style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
                    <p>{trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="nexus-actions-grid">
            <div className="nexus-action-box" onClick={() => handleSendMessage("Summarize this document")}>
              <Mail size={16} color="var(--dash-accent)" />
              <span>Summarize document</span>
            </div>
            <div className="nexus-action-box" onClick={() => handleSendMessage("Find key anomalies in data")}>
              <FileText size={16} color="var(--dash-accent)" />
              <span>Find anomalies</span>
            </div>
            <div className="nexus-action-box" onClick={() => handleSendMessage("Readability and metric score breakdown")}>
              <Calendar size={16} color="var(--dash-accent)" />
              <span>Show indices</span>
            </div>
            <div className="nexus-action-box" onClick={() => handleSendMessage("Detail file format metadata")}>
              <Sparkles size={16} color="var(--dash-accent)" />
              <span>Show file meta</span>
            </div>
          </div>

          {/* Floating Copilot Chat box */}
          <div className="nexus-chat-panel">
            <div className="nexus-chat-header">
              <h4>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--dash-accent)', borderRadius: '50%', display: 'inline-block' }}></span>
                <span>Copilot Chat</span>
              </h4>
              <HelpCircle size={14} style={{ color: 'var(--dash-text-muted)' }} />
            </div>

            <div className="nexus-chat-scroll">
              {chatMessages.slice(-2).map((msg, idx) => (
                <div key={idx} className={`nexus-msg-bubble ${msg.sender}`}>
                  {renderMsgText(msg.text)}
                </div>
              ))}
              {isThinking && (
                <div className="nexus-msg-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--dash-accent)' }}>Simplifying...</span>
                </div>
              )}
            </div>

            <div className="nexus-chat-input-row">
              <input 
                type="text" 
                placeholder="Ask follow-up questions..." 
                className="nexus-chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                disabled={isThinking}
              />
              <button 
                onClick={() => handleSendMessage(inputText)} 
                className="nexus-chat-btn"
                disabled={!inputText.trim() || isThinking}
              >
                <Send size={12} />
              </button>
            </div>
          </div>

        </aside>
      )}

      {/* 4. Interactive Profile Modal (PRD Avatar Switcher) */}
      {showProfileModal && (
        <div className="nexus-profile-modal-overlay">
          <div className="nexus-profile-modal-card glass-panel animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Edit Profile Picture</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <img src={profilePic} alt="Active profile pic" className="nexus-avatar-img" style={{ width: '60px', height: '60px', border: '2px solid var(--dash-accent)' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{user ? user.username : 'Naruka Sado'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--dash-text-secondary)' }}>{user ? user.email : 'analyst@nexdociq.ai'}</p>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginBottom: '12px', fontWeight: '600' }}>
              SELECT NEW AVATAR PORTRAIT
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {mockAvatars.map((url, i) => (
                <div 
                  key={i} 
                  className={`avatar-selection-wrapper ${profilePic === url ? 'selected' : ''}`}
                  onClick={() => handleAvatarChange(url)}
                  style={{ 
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: profilePic === url ? '2px solid var(--dash-accent)' : '1px solid var(--dash-border)'
                  }}
                >
                  <img src={url} alt={`Avatar option ${i}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                  {profilePic === url && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--dash-accent)', color: '#000000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Premium Glassmorphic Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <h3 className="delete-modal-title">
              <AlertCircle size={20} />
              <span>Confirm File Deletion</span>
            </h3>
            <p className="delete-modal-text">
              Are you sure you want to permanently delete <strong>{deleteConfirmDoc.name}</strong> from your active workspace? This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button 
                onClick={() => setDeleteConfirmDoc(null)} 
                className="delete-modal-btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="delete-modal-btn-confirm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Client fallbacks for stats generators if API fails

function getMockCsvStats(persona) {
  const activePersona = (persona || 'general').toLowerCase();
  return {
    isTabular: true,
    primaryMetric: activePersona === 'shopkeeper' ? "$2,840" : "124 Rows",
    primaryLabel: activePersona === 'shopkeeper' ? "Daily Balance" : "Data Scope",
    primarySubtext: activePersona === 'shopkeeper' ? "Profit details cleared" : "Total ledger spreadsheet rows",
    secMetric: activePersona === 'shopkeeper' ? "42 Orders" : "7 Columns",
    secLabel: activePersona === 'shopkeeper' ? "Weekly Traffic" : "Data Columns",
    secSubtext: activePersona === 'shopkeeper' ? "Transactions processed" : "Variables dimensions mapped",
    thirdMetric: activePersona === 'shopkeeper' ? "5 Alert" : "Grade A",
    thirdLabel: activePersona === 'shopkeeper' ? "Low Stock Items" : "Data Integrity",
    thirdSubtext: activePersona === 'shopkeeper' ? "Reorder items soon" : "Clean cell formatting matching",
    fourthMetric: activePersona === 'shopkeeper' ? "98% On-time" : "84%",
    fourthLabel: activePersona === 'shopkeeper' ? "Supplier Accuracy" : "Formulas Match",
    fourthSubtext: activePersona === 'shopkeeper' ? "On-time cargo delivery" : "Syntax compliance rate",
    summary: activePersona === 'student'
      ? "🎓 **Student Summary**: This data sheet reports transaction ledgers. Revenue increased by 14.3% this semester, showing that our software subscriptions did incredibly well!"
      : activePersona === 'shopkeeper'
      ? "🏪 **Shopkeeper Summary**: This monthly sales log sheet lists transaction registers. It shows total revenue reached $2.84M (+18% Vs last month). In ledger tab terms, we successfully closed 148 customer balance tabs with a sales conversion rate of 72%!"
      : "👤 **General Summary**: This sales spreadsheet details customer ledger rows. We see that overall sales revenue grew by 14.3% this quarter, meaning the company sold a lot more software subscriptions than expected!",
    chartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    indicators: {
      pipelineHealth: {
        value: "82%",
        title: activePersona === 'shopkeeper' ? "Store Activity" : "Data Quality",
        desc: "Checked ledger records",
        total: "Optimal levels",
        flagged: "98% Clean",
        color: "#10b981",
        bars: [50, 60, 45, 75, 82, 90, 65, 80, 85, 82, 70, 75, 80, 82, 90, 85]
      },
      dealsAtRisk: {
        value: "68.34%",
        title: activePersona === 'shopkeeper' ? "Credit Tabs Pending" : "Formula Errors",
        desc: "Review logs check",
        total: "Stable margin",
        flagged: "2 Spikes",
        color: "#f59e0b",
        bars: [30, 40, 50, 42, 60, 65, 58, 62, 68, 64, 55, 60, 65, 68, 60, 50]
      },
      billingStatus: {
        value: "62.34%",
        title: activePersona === 'shopkeeper' ? "Funds Cleared" : "Growth Index",
        desc: "Card payments ratio",
        total: "Completed ledgers",
        flagged: "Optimal",
        color: "#3b82f6",
        bars: [40, 30, 35, 45, 55, 60, 50, 58, 62, 59, 45, 50, 55, 62, 50, 40]
      }
    },
    activeDeals: [
      {
        id: 1,
        client: "Lena Harper",
        email: "lena.harper@influxmedia.co",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
        task: "Summer Collab with Glossi...",
        dueDate: "May 21",
        revenue: "$125",
        status: "In progress"
      },
      {
        id: 2,
        client: "Sophie Kim",
        email: "sophie.kim@creatorhive.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
        task: "Back-to-School with Notio...",
        dueDate: "May 11",
        revenue: "$320",
        status: "Pending"
      },
      {
        id: 3,
        client: "Noah Bennett",
        email: "noah.b@bennettstudio.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
        task: "YouTube Integration for Sq...",
        dueDate: "May 19",
        revenue: "$450",
        status: "Completed"
      }
    ]
  };
}

function getMockPdfStats(persona) {
  const activePersona = (persona || 'general').toLowerCase();
  return {
    isTabular: false,
    primaryMetric: "8 Min",
    primaryLabel: "Reading Duration",
    primarySubtext: "Average read duration",
    secMetric: "2,450",
    secLabel: "Word Count",
    secSubtext: "Optimal wording length",
    thirdMetric: activePersona === 'general' ? "Easy" : "Grade 10",
    thirdLabel: "Readability Score",
    thirdSubtext: activePersona === 'general' ? "Simple vocabulary" : "Grade 10 complexity",
    fourthMetric: "68%",
    fourthLabel: "Information Density",
    fourthSubtext: "Optimized semantic flow",
    summary: activePersona === 'student'
      ? "🎓 **Student Summary**: This strategy document details onboarding cycles. It maps how database setup steps cause a 64% drop-off in user signups. Introducing setup guides decreases setup time to 12 minutes, delivering a 24% signup activation bump."
      : activePersona === 'shopkeeper'
      ? "🏪 **Shopkeeper Summary**: This document describes onboarding guides. In trade terms, it tells us that a complex database connection step makes 64% of users walk away from their cart. Adding simple setups speeds up transaction times to 12 minutes, which boosts wholesale orders by 24%!"
      : "👤 **General Summary**: This strategy document details onboarding guides. In simple words, it shows that setting up a database is too hard, making 64% of people quit early. Making a simple helper guide speeds up setup times to 12 minutes, which gets 24% more signups!",
    chartLabels: ["Ch 1", "Ch 2", "Ch 3", "Ch 4", "Ch 5", "Ch 6", "Ch 7"],
    indicators: {
      score: {
        value: "82%",
        title: "Reading Ease",
        desc: "Flesch-Kincaid scale",
        total: "Optimal clarity level",
        flagged: "No jargon spikes",
        color: "#10b981",
        bars: [70, 75, 80, 82, 85, 88, 86, 84, 82, 80, 75, 80, 82, 84, 86, 88]
      },
      sentiment: {
        value: "76%",
        title: "Sentiment Score",
        desc: "Positive tone index",
        total: "82% paragraphs positive",
        flagged: "Optimistic",
        color: "#3b82f6",
        bars: [60, 65, 70, 72, 75, 76, 78, 75, 76, 74, 70, 72, 75, 76, 78, 75]
      },
      anomalies: {
        value: "0",
        title: "Vocabulary Spikes",
        desc: "Unexplained technical terms",
        total: "Clear definitions",
        flagged: "Perfect score",
        color: "#ff4d4d",
        bars: [5, 2, 0, 4, 1, 0, 0, 3, 0, 0, 2, 0, 1, 0, 0, 0]
      }
    },
    activeDeals: [
      {
        id: 1,
        client: "Introduction Section",
        email: "Pages 1-3 Overview",
        avatar: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80",
        task: "Summary: Details client acquisition strategies and team targets.",
        dueDate: "Sec 1",
        revenue: "3 pgs",
        status: "Completed"
      },
      {
        id: 2,
        client: "Setup Friction Analysis",
        email: "Pages 4-6 Audit",
        avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80",
        task: "Summary: Database configuration steps count as the major drop-off point.",
        dueDate: "Sec 2",
        revenue: "3 pgs",
        status: "In progress"
      },
      {
        id: 3,
        client: "Automation Guides Plan",
        email: "Pages 7-8 Guidelines",
        avatar: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&auto=format&fit=crop&q=80",
        task: "Summary: Details interactive wizard features, expecting 24% signup uptick.",
        dueDate: "Sec 3",
        revenue: "2 pgs",
        status: "Pending"
      }
    ]
  };
}
