import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import './Feedback.css';

const API_BASE = "/api";


export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('features');
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/feedback`);
      if (response.ok) {
        const rawText = await response.text();
        try {
          const data = JSON.parse(rawText);
          setFeedbacks(data || []);
        } catch (_) {
          setFeedbacks([]);
        }
      } else {
        throw new Error('Failed to load feedback');
      }
    } catch (err) {
      console.error("Feedback fetch error:", err);
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !comment) return;

    const payload = { name, email, category, rating, comment };

    try {
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const rawText = await response.text();
      if (response.ok) {
        // Reload reviews
        fetchFeedbacks();
      } else {
        let errorMsg = 'Failed to post feedback to backend';
        try {
          const errorData = JSON.parse(rawText);
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          if (rawText.trim()) errorMsg = rawText.trim();
        }
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Feedback post error:", err);
      let errMsg = err.message;
      if (errMsg === "Failed to fetch") errMsg = "Backend connection failed. If running locally, check if server is on port 5000.";
      alert("Failed to submit feedback: " + errMsg);
      return; // Do not clear the form on error
    }

    // Reset Form
    setName('');
    setEmail('');
    setCategory('features');
    setRating(5);
    setComment('');
    setSubmitted(true);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  // Calculate Average Rating
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 24px' }}>
      
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
        <span className="badge">User Feedback</span>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }} className="text-gradient">
          What our users say
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Help us improve NexDocIQ. Share your rating, report suggestions, or request features directly below.
        </p>
      </div>

      <div className="feedback-layout">
        
        {/* Left Side: Submit Feedback */}
        <div className="glass-panel feedback-form-card">
          {submitted ? (
            <div className="feedback-success-state">
              <CheckCircle size={48} className="text-accent" />
              <h3>Feedback Submitted!</h3>
              <p>Thank you for helping us make NexDocIQ better. Your comments are appreciated.</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary" style={{ marginTop: '16px' }}>
                Write another feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <h3>Share Your Experience</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                Your insights help shape future updates.
              </p>

              {/* Form Input fields */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="form-group rating-select-group" style={{ marginBottom: '20px' }}>
                <label>Rating</label>
                <div className="stars-row" style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="star-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={24}
                        className={
                          (hoverRating || rating) >= star 
                            ? 'star-icon filled' 
                            : 'star-icon'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked, or where we can improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={16} />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Ratings Metrics & Feedback Feed */}
        <div className="feedback-display-panel">
          
          {/* Summary Metric Header */}
          <div className="glass-panel avg-metric-card" style={{ display: 'flex', alignItems: 'center', gap: '30px', padding: '30px', marginBottom: '30px' }}>
            <div style={{ fontSize: '56px', fontWeight: '800', color: 'var(--accent-primary)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {avgRating}
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Average user Rating</h4>
              <div style={{ display: 'flex', gap: '4px', margin: '4px 0 8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={parseFloat(avgRating) >= star ? 'star-icon filled' : 'star-icon'}
                  />
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Based on {feedbacks.length} submissions</p>
            </div>
          </div>

          {/* Feedback Scroll Feed */}
          <div className="feedback-feed-header">
            <h4>Recent Reviews</h4>
            <MessageSquare size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div className="feedback-feed-scroll">
            {feedbacks.map((f, i) => (
              <div key={i} className="glass-panel feedback-feed-item">
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{f.name}</h5>
                    <span className="feedback-item-category">{f.category.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={f.rating >= star ? 'star-icon filled' : 'star-icon'}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                  {f.comment}
                </p>
                <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(f.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
