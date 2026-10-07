import React, { useState } from 'react';
import { 
  Video, 
  Camera,
  Sparkles, 
  Layers, 
  Music, 
  Hand, 
  RotateCw, 
  Compass, 
  ArrowUpRight, 
  Activity, 
  ChevronRight, 
  Zap, 
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

const DANCE_REFERENCES = [
  {
    id: 'bharatanatyam',
    title: 'Bharatanatyam',
    pose: 'Aramandi & Natyarambha',
    tagline: 'Diamond Grounded Stance',
    color: '#b45309',
    badgeType: 'badge-gold',
    keyMetrics: [
      { label: 'Knee Bend (Aramandi)', target: '~120° - 135°', note: 'Diamond flex' },
      { label: 'Shoulder-Elbow Line', target: '~160° - 170°', note: 'Shoulder height' },
      { label: 'Wrist Line & Mudra', target: '~170° - 175°', note: 'Pataka align' }
    ],
    targetRoute: '/analyze'
  },
  {
    id: 'kathakali',
    title: 'Kathakali',
    pose: 'Thoppi & Mudra Vinyasa',
    tagline: 'Theatrical Stance & Mudras',
    color: '#0284c7',
    badgeType: 'badge-peacock',
    keyMetrics: [
      { label: 'Foot Turnout / Knee', target: '~105° - 115°', note: 'Wide stance' },
      { label: 'Elbow & Shoulder Frame', target: '~90° - 95°', note: 'Heroic square' },
      { label: 'Wrist & Mudra Clarity', target: '~160° - 165°', note: 'Mudrakhya poise' }
    ],
    targetRoute: '/mudra-studio'
  },
  {
    id: 'kathak',
    title: 'Kathak',
    pose: 'Tatkar & Dynamic Chakkars',
    tagline: 'Spinal Poise & Spins',
    color: '#7c3aed',
    badgeType: 'badge-purple',
    keyMetrics: [
      { label: 'Upright Spine Angle', target: '~175° - 180°', note: 'Straight axis' },
      { label: 'Tatkar Knee Flexion', target: '~165°', note: 'Grounded stance' },
      { label: 'Wrist & Mudra Poise', target: '~160° - 170°', note: 'Tatkar speed' }
    ],
    targetRoute: '/tala-metronome'
  },
  {
    id: 'kuchipudi',
    title: 'Kuchipudi',
    pose: 'Ayatam & Tarangam Posture',
    tagline: 'Torso Wave & Balance',
    color: '#059669',
    badgeType: 'badge-emerald',
    keyMetrics: [
      { label: 'Knee Flexion (Ayatam)', target: '~125° - 138°', note: 'Demi-squat' },
      { label: 'Shoulder & Arm Elevation', target: '~85° - 90°', note: 'Fluid wave' },
      { label: 'Wrist & Hasta Alignment', target: '~165° - 170°', note: 'Alapadma precision' }
    ],
    targetRoute: '/analyze'
  },
  {
    id: 'mohiniyattam',
    title: 'Mohiniyattam',
    pose: 'Lasya Mandi & Andolika Sway',
    tagline: 'Soft Torso Waves & Grace',
    color: '#dc2626',
    badgeType: 'badge-maroon',
    keyMetrics: [
      { label: 'Soft Knee Flexion', target: '~145° - 155°', note: 'Gentle bend' },
      { label: 'Shoulder Level & Sway', target: '~80° - 85°', note: 'Circular wave' },
      { label: 'Wrist Poise (Anjali)', target: '~150° - 168°', note: 'Lasya grace' }
    ],
    targetRoute: '/analyze'
  }
];

const CORE_MODULES = [
  {
    title: 'Live Rehearsal Mirror',
    subtitle: 'Real-Time AI Practice',
    icon: Camera,
    route: '/live-rehearsal',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bg: '#ecfdf5',
    badge: 'Live Mirror HUD'
  },
  {
    title: 'Kinematic Studio',
    subtitle: 'Pose Analysis',
    icon: Video,
    route: '/analyze',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    bg: '#f0f9ff',
    badge: 'Live Camera'
  },
  {
    title: 'Style Classification',
    subtitle: 'AI Recognition',
    icon: Sparkles,
    route: '/classify',
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    bg: '#fef3c7',
    badge: 'Deep Vision'
  },
  {
    title: 'Digital Twin Studio',
    subtitle: 'Side-by-Side Match',
    icon: Layers,
    route: '/digital-twin',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    bg: '#f5f3ff',
    badge: 'Guru Match'
  },
  {
    title: 'Mudra Studio',
    subtitle: '52 Hastas Lexicon',
    icon: Hand,
    route: '/mudra-studio',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bg: '#ecfdf5',
    badge: '21 Joints'
  },
  {
    title: 'Tala Metronome',
    subtitle: 'Rhythm Engine',
    icon: Music,
    route: '/tala-metronome',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bg: '#fef2f2',
    badge: 'Nattuvangam'
  },
  {
    title: '3D Spatial MoCap',
    subtitle: '3D Video Studio',
    icon: RotateCw,
    route: '/3d-studio',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    bg: '#f0f9ff',
    badge: '3D MoCap'
  },
  {
    title: 'Analysis Vault',
    subtitle: 'Rehearsal Archive',
    icon: Activity,
    route: '/history',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bg: '#ecfdf5',
    badge: 'Personal Stats'
  }
];

export default function Dashboard() {
  const [activeRefIndex, setActiveRefIndex] = useState(0);
  const navigate = useNavigate();

  const activeRef = DANCE_REFERENCES[activeRefIndex] || DANCE_REFERENCES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* 1. HERO BANNER */}
      <div 
        className="temple-panel"
        style={{ 
          padding: '2.25rem 2.25rem', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: '#ffffff',
          border: '1px solid var(--border-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={logoImg} 
                alt="Natyaa AI Logo" 
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(217, 119, 6, 0.4)',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.15)',
                  objectFit: 'cover',
                  background: '#ffffff'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '-2px', 
                  right: '-2px', 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  background: 'var(--emerald-primary)', 
                  border: '2.5px solid #ffffff',
                }} 
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">
                  <Sparkles size={12} /> Classical Dance AI
                </span>
                <span className="badge badge-emerald">
                  <Zap size={12} /> 5 Traditions
                </span>
                <span className="badge badge-peacock">
                  <Target size={12} /> Real-Time Vision
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Classical Dance Intelligence Platform
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/analyze')}
              className="btn-primary"
              style={{ fontSize: '0.9rem', padding: '10px 20px' }}
            >
              <Video size={16} /> Kinematic Studio
            </button>
            <button 
              onClick={() => navigate('/digital-twin')}
              className="btn-secondary"
              style={{ fontSize: '0.9rem', padding: '10px 18px' }}
            >
              <Layers size={16} /> Digital Twin
            </button>
          </div>
        </div>

        {/* Quick Feature Stats Strip */}
        <div className="grid-cards-stats" style={{ position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Skeletal Tracking', val: '33 Keypoints', color: 'var(--slate-primary)', bg: '#f8fafc', border: '#e2e8f0' },
            { label: 'Mudra Lexicon', val: '52 Hastas', color: 'var(--slate-primary)', bg: '#f8fafc', border: '#e2e8f0' },
            { label: 'Rhythm Engine', val: 'Multi-Tala Synthesizer', color: 'var(--slate-primary)', bg: '#f8fafc', border: '#e2e8f0' },
            { label: 'Telemetry', val: 'Real-Time Precision', color: 'var(--slate-primary)', bg: '#f8fafc', border: '#e2e8f0' }
          ].map((item, i) => (
            <div 
              key={i} 
              style={{ 
                background: item.bg, 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-sm)', 
                border: `1px solid ${item.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.92rem', color: item.color, fontWeight: 700 }}>
                  {item.val}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DANCE REFERENCE STANDARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Compass size={18} color="var(--gold-light)" />
              Pose Reference Standards
            </h2>
          </div>

          {/* Form Selector Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            background: '#ffffff', 
            padding: '4px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-card)', 
            boxShadow: 'var(--shadow-xs)', 
            flexWrap: 'wrap' 
          }}>
            {DANCE_REFERENCES.map((ref, idx) => (
              <button
                key={ref.id}
                onClick={() => setActiveRefIndex(idx)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: activeRefIndex === idx ? 700 : 500,
                  cursor: 'pointer',
                  color: activeRefIndex === idx ? '#ffffff' : 'var(--text-secondary)',
                  background: activeRefIndex === idx ? 'var(--grad-primary)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {ref.title}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Showcase Card */}
        <div 
          className="glass-panel" 
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <span className={`badge ${activeRef.badgeType}`} style={{ fontSize: '0.74rem' }}>
                  {activeRef.title}
                </span>
                <span className="badge badge-slate" style={{ fontSize: '0.74rem' }}>
                  {activeRef.tagline}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {activeRef.pose}
              </h3>
            </div>

            <button
              onClick={() => navigate(activeRef.targetRoute)}
              className="btn-gold"
              style={{ fontSize: '0.86rem', padding: '8px 16px' }}
            >
              <span>Practice in Studio</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Target Angles Grid */}
          <div className="grid-cards-dense">
            {activeRef.keyMetrics.map((km, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px',
                  padding: '0.9rem 1.1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `4px solid ${i === 0 ? 'var(--gold-light)' : i === 1 ? 'var(--cyan-primary)' : 'var(--emerald-primary)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {km.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {km.note}
                  </span>
                </div>
                <span style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace' }}>
                  {km.target}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right' }}>
            * All canonical joint degree values are pedagogical kinematic approximations (±3°–5°).
          </div>

        </div>
      </div>

      {/* 3. CORE AI STUDIOS */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Sparkles size={18} color="var(--gold-light)" />
            AI Motion Studios
          </h2>
        </div>

        <div className="grid-cards-auto">
          {CORE_MODULES.map((mod, idx) => {
            const Icon = mod.icon || Sparkles;
            return (
              <div 
                key={idx}
                className="glass-panel card-fill-height" 
                style={{ 
                  padding: '1.35rem', 
                  cursor: 'pointer', 
                  borderTop: `3px solid ${mod.color}`,
                  background: '#ffffff'
                }}
                onClick={() => navigate(mod.route)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    background: mod.bg, 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: 'var(--radius-sm)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: mod.color
                  }}>
                    <Icon size={20} color={mod.color} />
                  </div>

                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-full)', 
                    background: mod.bg, 
                    color: mod.color,
                    border: `1px solid ${mod.color}25`
                  }}>
                    {mod.badge}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>
                    {mod.subtitle}
                  </span>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: '2px 0 0 0', fontWeight: 700 }}>
                    {mod.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: mod.color, fontSize: '0.84rem', fontWeight: 700, marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <span>Enter Studio</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
