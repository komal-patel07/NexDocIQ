import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Feedback from './pages/Feedback';
import './App.css';

const API_BASE = "/api";

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
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data);
      localStorage.setItem('explainer_current_user', JSON.stringify(data));
      setPage('dashboard');
      return { success: true };
    } catch (err) {
      console.error("Login API error, trying local sandbox fallback:", err);
      const users = JSON.parse(localStorage.getItem('explainer_users') || '[]');
      const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (foundUser || (credentials.email === 'demo@example.com' && credentials.password === 'password')) {
        const fallbackUser = foundUser || { id: 'demo-1', username: 'DemoUser', email: 'demo@example.com' };
        setUser(fallbackUser);
        localStorage.setItem('explainer_current_user', JSON.stringify(fallbackUser));
        setPage('dashboard');
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setUser(data);
      localStorage.setItem('explainer_current_user', JSON.stringify(data));
      setPage('dashboard');
      return { success: true };
    } catch (err) {
      console.error("Register API error, saving to local store:", err);
      const users = JSON.parse(localStorage.getItem('explainer_users') || '[]');
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' };
      }
      const newUser = { id: Date.now().toString(), ...userData };
      users.push(newUser);
      localStorage.setItem('explainer_users', JSON.stringify(users));
      setUser({ id: newUser.id, username: newUser.username, email: newUser.email });
      localStorage.setItem('explainer_current_user', JSON.stringify(newUser));
      setPage('dashboard');
      return { success: true };
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
