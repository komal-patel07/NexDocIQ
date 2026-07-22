import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Feedback from './pages/Feedback';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : "/api";

function App() {
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem('explainer_current_page');
    const savedUser = localStorage.getItem('explainer_current_user');
    if (savedPage) {
      if (savedPage === 'dashboard' && !savedUser) {
        return 'home';
      }
      return savedPage;
    }
    return 'home';
  });
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState('general'); // general | student | shopkeeper | business

  // Save page state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('explainer_current_page', page);
  }, [page]);

  // Restore auth session and persona on load
  useEffect(() => {
    const savedUser = localStorage.getItem('explainer_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedPersona = localStorage.getItem('explainer_persona');
    if (savedPersona) {
      setPersona(savedPersona);
    }
  }, []);

  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona);
    localStorage.setItem('explainer_persona', newPersona);
  };

  // Handle Login session calling Backend
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const rawText = await response.text();
      let data = {};
      try { data = JSON.parse(rawText); } catch (_) {}
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data);
      localStorage.setItem('explainer_current_user', JSON.stringify(data));
      setPage('dashboard');
      return { success: true };
    } catch (err) {
      console.error("Login API error:", err);
      let errorMessage = err.message;
      if (errorMessage === "Failed to fetch") {
        errorMessage = "Backend connection failed. If running locally, check if server is on port 5000.";
      }
      return { success: false, error: errorMessage };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const rawText = await response.text();
      let data = {};
      try { data = JSON.parse(rawText); } catch (_) {}
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setUser(data);
      localStorage.setItem('explainer_current_user', JSON.stringify(data));
      setPage('dashboard');
      return { success: true };
    } catch (err) {
      console.error("Register API error:", err);
      let errorMessage = err.message;
      if (errorMessage === "Failed to fetch") {
        errorMessage = "Backend connection failed. If running locally, check if server is on port 5000.";
      }
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('explainer_current_user');
    setPage('home');
  };

  return (
    <div className="app-wrapper">
      <Header 
        currentPage={page} 
        setPage={setPage} 
        user={user} 
        handleLogout={handleLogout} 
      />

      <main className="main-content">
        {page === 'home' && (
          <Home 
            setPage={setPage} 
            user={user} 
            activePersona={persona} 
            onPersonaChange={handlePersonaChange} 
          />
        )}
        
        {page === 'auth' && (
          <Auth 
            handleLogin={handleLogin} 
            handleRegister={handleRegister} 
            setPage={setPage} 
          />
        )}
        
        {page === 'dashboard' && (
          <Dashboard 
            user={user}
            persona={persona}
            onPersonaChange={handlePersonaChange}
          />
        )}
        
        {page === 'about' && (
          <About setPage={setPage} />
        )}
        
        {page === 'feedback' && (
          <Feedback />
        )}
      </main>

      {page !== 'dashboard' && <Footer setPage={setPage} />}
    </div>
  );
}

export default App;
