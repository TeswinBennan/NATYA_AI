import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Camera, 
  Video, 
  Layers, 
  Hand, 
  Music, 
  RotateCw, 
  Activity, 
  ShieldCheck
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer 
      className="glass-panel footer-container"
      style={{
        padding: '2.5rem 2rem 1.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        background: '#ffffff',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 20
      }}
    >

      {/* Top Main Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '2.5rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        {/* Col 1: Logo & Project Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={logoImg} 
              alt="NATYAA AI Logo" 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                border: '1.5px solid rgba(217, 119, 6, 0.4)',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
                objectFit: 'cover',
                background: '#ffffff'
              }}
            />
            <div>
              <div style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                NATYAA <span style={{ color: 'var(--gold-light)' }}>AI</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Classical Motion Studio
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
            Next-Gen Multimodal Artificial Intelligence platform for Indian Classical Dance kinematic posture analysis, 3D spatial MoCap, and 52 Hastha Mudra recognition.
          </p>

          <div style={{ fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--gold-dark)', borderLeft: '2px solid var(--gold-light)', paddingLeft: '8px' }}>
            "यतो हस्तस्ततो दृष्टिः यतो दृष्टिस्ततो मनः" <br/>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Where hand goes, vision follows; where vision goes, mind follows.</span>
          </div>
        </div>

        {/* Col 2: Core AI Studios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Studios
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <li>
              <Link to="/live-rehearsal" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Camera size={14} color="var(--emerald-primary)" /> Live Rehearsal Mirror
              </Link>
            </li>
            <li>
              <Link to="/analyze" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Video size={14} color="var(--cyan-primary)" /> Kinematic Pose Studio
              </Link>
            </li>
            <li>
              <Link to="/digital-twin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Layers size={14} color="var(--purple-primary)" /> Digital Twin Studio
              </Link>
            </li>
            <li>
              <Link to="/3d-studio" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <RotateCw size={14} color="var(--cyan-primary)" /> 3D Spatial MoCap
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Heritage & Rhythm Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Heritage & Tools
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <li>
              <Link to="/mudra-studio" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Hand size={14} color="var(--emerald-primary)" /> 52 Hastha Mudra Studio
              </Link>
            </li>
            <li>
              <Link to="/tala-metronome" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Music size={14} color="var(--rose-primary)" /> Classical Tala Metronome
              </Link>
            </li>
            <li>
              <Link to="/classify" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Sparkles size={14} color="var(--gold-light)" /> Style Classification
              </Link>
            </li>
            <li>
              <Link to="/history" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                <Activity size={14} color="var(--emerald-primary)" /> Rehearsal Vault
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Classical Traditions Supported */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            5 Traditions Supported
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['Bharatanatyam', 'Kathak', 'Kathakali', 'Kuchipudi', 'Mohiniyattam'].map(trad => (
              <span 
                key={trad}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gold-bg)',
                  border: '1px solid #fde68a',
                  color: 'var(--gold-dark)',
                  fontWeight: 600
                }}
              >
                {trad}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="var(--emerald-primary)" />
            <span>Natyashastra & Abhinaya Darpana Standard</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div 
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>© {new Date().getFullYear()} <strong>NATYAA AI</strong>. Preserving Indian Classical Heritage with Artificial Intelligence.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>Version 2.0.0</span>
          <span>•</span>
          <span style={{ color: 'var(--emerald-primary)', fontWeight: 600 }}>All AI Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
