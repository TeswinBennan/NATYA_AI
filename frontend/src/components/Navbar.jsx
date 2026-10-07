import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSystemHealth } from '../services/api';
import { LogOut, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState({ status: 'healthy' });

  useEffect(() => {
    getSystemHealth()
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className="glass-panel navbar-container" 
      style={{
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-md)',
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >

      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-secondary mobile-menu-btn"
          style={{ padding: '8px', display: 'none' }}
          aria-label="Toggle Navigation"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img 
            src={logoImg} 
            alt="Natyaa AI Logo" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1.5px solid rgba(217, 119, 6, 0.4)',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
              objectFit: 'cover',
              background: '#ffffff'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                NATYAA <span style={{ color: 'var(--gold-light)' }}>AI</span>
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '-2px', fontWeight: 600 }}>
              Classical Motion Studio
            </span>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="navbar-center-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '5px 12px', 
            borderRadius: 'var(--radius-full)', 
            background: health.status === 'healthy' ? 'var(--emerald-bg)' : 'var(--rose-bg)',
            border: `1px solid ${health.status === 'healthy' ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: health.status === 'healthy' ? 'var(--emerald-primary)' : 'var(--rose-primary)',
            }} 
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: health.status === 'healthy' ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>
            {health.status === 'healthy' ? 'AI Engine Online' : 'AI Offline'}
          </span>
        </div>
      </div>

      {/* User Profile & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-profile-meta" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.full_name || user?.username || 'Dancer'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gold-light)', fontWeight: 600 }}>
                {user?.dance_form_interest || 'Bharatanatyam'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.84rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.84rem' }}>
              Join Studio
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
