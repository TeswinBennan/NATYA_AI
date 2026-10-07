import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Camera,
  Layers,
  Sparkles,
  Music,
  Hand,
  RotateCw,
  X,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';

const navSections = [
  {
    title: 'STUDIO',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#b45309', bg: '#fef3c7' },
      { path: '/live-rehearsal', label: 'Live Rehearsal Mirror', icon: Camera, color: '#059669', bg: '#ecfdf5' },
      { path: '/analyze', label: 'Kinematic Studio', icon: Video, color: '#0284c7', bg: '#f0f9ff' },
    ]
  },
  {
    title: 'HERITAGE AI',
    items: [
      { path: '/classify', label: 'Style Classifier', icon: Sparkles, color: '#b45309', bg: '#fef3c7' },
      { path: '/digital-twin', label: 'Digital Twin Studio', icon: Layers, color: '#7c3aed', bg: '#f5f3ff' },
      { path: '/mudra-studio', label: 'Mudra Studio', icon: Hand, color: '#059669', bg: '#ecfdf5' },
    ]
  },
  {
    title: 'RHYTHM & 3D',
    items: [
      { path: '/tala-metronome', label: 'Tala Metronome', icon: Music, color: '#dc2626', bg: '#fef2f2' },
      { path: '/3d-studio', label: '3D Spatial MoCap', icon: RotateCw, color: '#0284c7', bg: '#f0f9ff' },
    ]
  },
  {
    title: 'ARCHIVES',
    items: [
      { path: '/history', label: 'Analysis Vault', icon: Activity, color: '#059669', bg: '#ecfdf5' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <aside
        className={`glass-panel sidebar-desktop ${isOpen ? 'open' : ''}`}
        style={{
          width: '250px',
          minWidth: '250px',
          margin: '1rem 0 1rem 1rem',
          padding: '1.25rem 0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderRadius: 'var(--radius-md)',
          height: 'calc(100vh - 2rem)',
          position: 'sticky',
          top: '1rem',
          overflowY: 'auto',
          zIndex: 999,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* 1. Header with Logo & Mobile Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={logoImg} 
              alt="Natyaa Logo" 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1.5px solid rgba(217, 119, 6, 0.4)',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)',
                objectFit: 'cover',
                background: '#ffffff'
              }}
            />
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em', display: 'block', lineHeight: 1.1 }}>
                NATYAA <span style={{ color: 'var(--gold-light)' }}>AI</span>
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--gold-light)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                STUDIO PORTAL
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-secondary mobile-close-btn"
              style={{ padding: '4px', display: 'none', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 2. Sectioned Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          {navSections.map((sec) => (
            <div key={sec.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '2px' }}>
                {sec.title}
              </span>
              
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? '#f1f5f9' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--gold-light)' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: item.bg,
                            color: item.color,
                            flexShrink: 0
                          }}>
                            <Icon size={13} />
                          </div>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight size={13} color="var(--gold-light)" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 3. Live AI Vision & Telemetry Widget */}
        <div 
          style={{ 
            marginTop: 'auto', 
            padding: '12px 10px', 
            background: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--emerald-primary)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Vision Engine
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--gold-dark)', fontWeight: 700, background: 'var(--gold-bg)', padding: '2px 6px', borderRadius: '4px' }}>
              30 FPS
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>Pose Tracker</span>
            <span style={{ color: 'var(--slate-primary)', fontWeight: 600 }}>33 Keypoints</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>Mudra Lexicon</span>
            <span style={{ color: 'var(--slate-primary)', fontWeight: 600 }}>21 Joints</span>
          </div>

          <button
            onClick={() => {
              navigate('/live-rehearsal');
              if (onClose) onClose();
            }}
            className="btn-primary"
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.76rem', 
              width: '100%', 
              marginTop: '4px',
              borderRadius: '6px' 
            }}
          >
            <Camera size={13} />
            <span>Launch Mirror HUD</span>
          </button>
        </div>

        {/* 4. Dancer Profile & Footer */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--grad-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)',
              flexShrink: 0
            }}>
              {(user?.full_name || user?.username || 'D')?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || user?.username || 'Dancer'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--gold-light)', fontWeight: 600 }}>
                {user?.dance_form_interest || 'Classical Dancer'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-close-btn {
            display: inline-flex !important;
          }
          aside.sidebar-desktop {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
            height: 100vh !important;
            border-radius: 0 !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 1000 !important;
          }
          aside.sidebar-desktop.open {
            transform: translateX(0) !important;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.2) !important;
          }
        }
      `}</style>
    </>
  );
}
