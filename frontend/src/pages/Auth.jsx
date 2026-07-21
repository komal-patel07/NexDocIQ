import React, { useState } from 'react';
import { Terminal, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function Auth({ handleLogin, handleRegister, setPage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await handleLogin({ email, password });
        if (!result.success) {
          setError(result.error || 'Invalid credentials. Try demo@example.com / password.');
        }
      } else {
        const result = await handleRegister({ username, email, password });
        if (!result.success) {
          setError(result.error || 'Failed to register.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container animate-fade-in">
      <div className="auth-grid glass-panel">
        
        {/* Left Side: Product Showcase Info */}
        <div className="auth-showcase">
          <div className="bg-glow-orb" style={{ width: '300px', height: '300px', top: '-50px', left: '-50px' }}></div>
          <div className="auth-showcase-content">
            <div className="logo" style={{ marginBottom: '40px' }}>
              <Terminal className="logo-icon" size={28} />
              <span>Nex<span className="text-accent">DocIQ</span></span>
            </div>
            
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Unlock the story hidden within your data files.</h2>
            
            <div className="feature-bullet">
              <ShieldCheck size={20} className="text-accent" />
              <div>
                <h5>Secure parsing Sandbox</h5>
                <p>Your documents are parsed locally in-memory, keeping critical reports confidential.</p>
              </div>
            </div>

            <div className="feature-bullet">
              <ShieldCheck size={20} className="text-accent" />
              <div>
                <h5>Semantic Search Index</h5>
                <p>Natural conversation matches exact document segments for quick cross-referencing.</p>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Demo credentials:<br />
                <code style={{ color: 'var(--accent-primary)' }}>demo@example.com</code> / <code style={{ color: 'var(--accent-primary)' }}>password</code>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-side">
          <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            {isLogin ? 'Sign in to access your document dashboard' : 'Sign up to upload and analyze datasets'}
          </p>

          {error && (
            <div className="auth-error-msg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrap">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder={isLogin ? '••••••••' : 'Choose a strong password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
              <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'underline' }}
                disabled={loading}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
