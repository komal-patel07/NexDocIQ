import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Bot, User, Sparkles, Loader } from 'lucide-react';
import './Chat.css';

export default function Chat({ activeDoc, documents, setActiveDoc, chatHistories, addChatMessage }) {
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll chat window
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistories, activeDoc, isThinking]);

  // Ensure an active document is selected
  useEffect(() => {
    if (!activeDoc && documents.length > 0) {
      setActiveDoc(documents[0]);
    }
  }, [activeDoc, documents, setActiveDoc]);

  const activeDocId = activeDoc ? activeDoc.id : '';
  const currentHistory = chatHistories[activeDocId] || [
    {
      sender: 'ai',
      text: `Hello! I have indexed the document **${activeDoc?.name || 'document'}** successfully. Ask me any questions or choose one of the suggested prompts on the left sidebar to start analyzing!`,
      date: new Date().toISOString()
    }
  ];

  // Helper response builder
  const buildAIResponse = (userMsg, doc) => {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('summarize') || msg.includes('summary') || msg.includes('digest')) {
      return `### Executive summary for **${doc.name}**\n\n${doc.summary}\n\nThis document is parsed under ${doc.metadata.type} format settings.`;
    }

    if (msg.includes('anomaly') || msg.includes('anomalies') || msg.includes('insights') || msg.includes('key')) {
      const insightList = doc.insights.map(ins => `- ${ins}`).join('\n');
      return `### Key Insights & Extracted metrics for **${doc.name}**:\n\n${insightList}\n\nWould you like me to expand on any of these points?`;
    }

    if (msg.includes('readability') || msg.includes('difficult') || msg.includes('sentiments') || msg.includes('score')) {
      const metricList = doc.metrics.map(m => `- **${m.label}**: ${m.val}%`).join('\n');
      return `### Performance Metrics breakdown:\n\nHere are the metadata indices processed from **${doc.name}**:\n\n${metricList}\n\nOur parser indices indicate optimal reading levels and syntax integrity.`;
    }

    if (msg.includes('format') || msg.includes('size') || msg.includes('meta')) {
      return `### File Metadata Details:\n- **File Name**: ${doc.name}\n- **Format**: ${doc.metadata.type}\n- **Size**: ${doc.metadata.size}\n- **Ingest Timestamp**: ${new Date(doc.date).toLocaleString()}\n- **Scale Vector**: ${doc.metadata.words !== '-' ? `${doc.metadata.words} words` : `${doc.metadata.rows} rows x ${doc.metadata.cols} columns`}`;
    }

    // Default contextual answer
    return `Based on my semantic indexing of **${doc.name}**, this file represents a structured ${doc.metadata.type} report. In relation to your query about *"_${userMsg}_"*, I have verified that the document focuses on: \n\n1. **${doc.insights[0] || 'Strategic milestones'}**\n2. Key indicators mapping to standard metrics.\n\nLet me know if you would like me to isolate specific sentences or table values from the raw text.`;
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim() || !activeDoc) return;

    // 1. Add User Message
    addChatMessage(activeDoc.id, {
      sender: 'user',
      text: textToSend,
      date: new Date().toISOString()
    });

    setInputText('');
    setIsThinking(true);

    // 2. Simulate AI Typing response delay
    setTimeout(() => {
      const responseText = buildAIResponse(textToSend, activeDoc);
      addChatMessage(activeDoc.id, {
        sender: 'ai',
        text: responseText,
        date: new Date().toISOString()
      });
      setIsThinking(false);
    }, 1200);
  };

  const handleSuggestionClick = (prompt) => {
    handleSendMessage(prompt);
  };

  // Convert markdown bold and bullets into simple HTML for demonstration
  const renderMessageContent = (text) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} style={{ margin: '12px 0 6px', color: 'var(--accent-primary)', fontSize: '15px' }}>{line.replace('### ', '')}</h4>;
      }
      // Bullets
      if (line.startsWith('- ')) {
        content = line.replace('- ', '');
        return (
          <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'square' }}>
            {parseBoldText(content)}
          </li>
        );
      }
      return <p key={i} style={{ marginBottom: '8px' }}>{parseBoldText(content)}</p>;
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*|_(.*?)_/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} style={{ color: 'var(--accent-secondary)' }}>{part}</strong>;
      }
      return part;
    });
  };

  if (!activeDoc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <FileText size={48} />
        <h3>Upload a file to activate chat</h3>
      </div>
    );
  }

  return (
    <div className="chat-container">
      
      {/* Left side controller */}
      <aside className="chat-config-pane">
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            SELECT DOCUMENT
          </label>
          <select 
            value={activeDocId} 
            onChange={(e) => setActiveDoc(documents.find(d => d.id === e.target.value))}
            className="doc-dropdown"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            <Sparkles size={14} className="text-accent" />
            <span>Suggested Queries</span>
          </h3>
          
          <div className="prompt-suggestions-box">
            <button onClick={() => handleSuggestionClick("Summarize this document")} className="prompt-suggestion-pill">
              Summarize document
            </button>
            <button onClick={() => handleSuggestionClick("Find key anomalies in the data")} className="prompt-suggestion-pill">
              Find key anomalies
            </button>
            <button onClick={() => handleSuggestionClick("Readability and metric score breakdown")} className="prompt-suggestion-pill">
              Show metric breakdowns
            </button>
            <button onClick={() => handleSuggestionClick("Detail file format meta")} className="prompt-suggestion-pill">
              Show metadata stats
            </button>
          </div>
        </div>
      </aside>

      {/* Right side Dialogue Area */}
      <div className="chat-dialogue-pane">
        
        <div className="chat-history-scroll">
          {currentHistory.map((msg, i) => (
            <div key={i} className={`chat-bubble-row ${msg.sender}`}>
              <div className="chat-bubble">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {msg.sender === 'ai' ? (
                    <>
                      <Bot size={12} color="var(--accent-primary)" />
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>EXPLAINER AI</span>
                    </>
                  ) : (
                    <>
                      <User size={12} />
                      <span style={{ fontWeight: '600' }}>USER</span>
                    </>
                  )}
                  <span>&bull; {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking bubble */}
          {isThinking && (
            <div className="chat-bubble-row ai thinking">
              <div className="chat-bubble">
                <Loader size={16} className="animate-float" style={{ animationDuration: '1.5s', marginRight: '6px' }} />
                <span>AI is extracting context...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef}></div>
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input-field"
            placeholder={`Ask a question about ${activeDoc.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            disabled={isThinking}
          />
          <button 
            onClick={() => handleSendMessage(inputText)} 
            className="chat-send-btn"
            disabled={!inputText.trim() || isThinking}
          >
            <Send size={18} />
          </button>
        </div>

      </div>

    </div>
  );
}
