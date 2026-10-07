import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  SplitSquareHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Zap, 
  Compass, 
  Check, 
  Video, 
  Film,
  Play,
  Pause,
  ChevronRight, 
  MapPin, 
  Layers, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Info, 
  Eye, 
  Sliders, 
  Flame,
  Music,
  Clock,
  Gauge,
  Download,
  Maximize2
} from 'lucide-react';
import { comparePoseImages, comparePoseVideos, API_BASE_URL } from '../services/api';

const TRADITIONS = [
  { id: 'auto', label: 'Auto-Detect with AI', icon: Wand2, desc: 'AI Neural Multi-Modal Classifier' },
  { id: 'Bharatanatyam', label: 'Bharatanatyam', icon: Sparkles, desc: 'Tamil Nadu • Aramandi & Natyarambha' },
  { id: 'Kathak', label: 'Kathak', icon: Activity, desc: 'North India • Chakkars & Tatkar' },
  { id: 'Kathakali', label: 'Kathakali', icon: Zap, desc: 'Kerala • Kalasam & Heroic Stance' },
  { id: 'Kuchipudi', label: 'Kuchipudi', icon: Compass, desc: 'Andhra Pradesh • Tribhanga & Tarangam' },
  { id: 'Mohiniyattam', label: 'Mohiniyattam', icon: CheckCircle2, desc: 'Kerala • Lasya & Kasavu Sway' }
];

export default function DigitalTwin() {
  // Mode: 'photo' | 'video'
  const [twinMode, setTwinMode] = useState('photo');
  const [selectedTradition, setSelectedTradition] = useState('auto');

  // Photo state
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [userPhotoPreviewUrl, setUserPhotoPreviewUrl] = useState(null);
  const [refPhotoFile, setRefPhotoFile] = useState(null);
  const [refPhotoPreviewUrl, setRefPhotoPreviewUrl] = useState(null);

  // Video state
  const [userVideoFile, setUserVideoFile] = useState(null);
  const [userVideoPreviewUrl, setUserVideoPreviewUrl] = useState(null);
  const [refVideoFile, setRefVideoFile] = useState(null);
  const [refVideoPreviewUrl, setRefVideoPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Analysis & Results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTelemetryTab, setActiveTelemetryTab] = useState('composite'); // 'composite' | 'skeletons'
  const [activeVideoTab, setActiveVideoTab] = useState('video'); // 'video' | 'timeline'

  // Photo handlers
  const handleUserPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserPhotoFile(file);
      setUserPhotoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleRefPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRefPhotoFile(file);
      setRefPhotoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const clearUserPhoto = (e) => {
    e.stopPropagation();
    setUserPhotoFile(null);
    setUserPhotoPreviewUrl(null);
    setResult(null);
    setError('');
  };

  const clearRefPhoto = (e) => {
    e.stopPropagation();
    setRefPhotoFile(null);
    setRefPhotoPreviewUrl(null);
    setResult(null);
    setError('');
  };

  // Video handlers
  const handleUserVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserVideoFile(file);
      setUserVideoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleRefVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRefVideoFile(file);
      setRefVideoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const clearUserVideo = (e) => {
    e.stopPropagation();
    setUserVideoFile(null);
    setUserVideoPreviewUrl(null);
    setResult(null);
    setError('');
  };

  const clearRefVideo = (e) => {
    e.stopPropagation();
    setRefVideoFile(null);
    setRefVideoPreviewUrl(null);
    setResult(null);
    setError('');
  };

  // Run Photo Comparison
  const handlePhotoCompare = async () => {
    if (!userPhotoFile && !refPhotoFile) {
      setError('Please upload at least your posture photo to begin Photo Digital Twin analysis.');
      return;
    }
    
    const primaryFile = userPhotoFile || refPhotoFile;
    const secondaryFile = (userPhotoFile && refPhotoFile) ? refPhotoFile : null;

    setIsAnalyzing(true);
    setError('');
    
    try {
      const data = await comparePoseImages(primaryFile, secondaryFile, selectedTradition);
      if (data && data.success) {
        setResult(data);
      } else {
        setError(data?.message || 'Digital Twin comparison did not return valid metrics.');
      }
    } catch (err) {
      console.error('Photo Comparison error:', err);
      setError('Digital Twin analysis failed. Please ensure full-body dancer posture is clearly visible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Video Comparison
  const handleVideoCompare = async () => {
    if (!userVideoFile && !refVideoFile) {
      setError('Please upload at least your dance performance video to begin Motion Twin analysis.');
      return;
    }

    const primaryFile = userVideoFile || refVideoFile;
    const secondaryFile = (userVideoFile && refVideoFile) ? refVideoFile : null;

    setIsAnalyzing(true);
    setUploadProgress(0);
    setError('');

    try {
      const data = await comparePoseVideos(
        primaryFile, 
        secondaryFile, 
        selectedTradition,
        (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      );

      if (data && data.success) {
        setResult(data);
      } else {
        setError(data?.message || 'Motion Twin video comparison did not return valid metrics.');
      }
    } catch (err) {
      console.error('Video Comparison error:', err);
      setError('Motion Twin video analysis failed. Please ensure dancer movement is in frame with good lighting.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getFullMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header Banner */}
      <div 
        className="temple-panel" 
        style={{ 
          padding: '2.25rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><SplitSquareHorizontal size={13} /> Guru-Shishya Alignment</span>
            <span className="badge badge-emerald"><CheckCircle2 size={12} /> Dance Form Prediction</span>
            <span className="badge badge-peacock"><Video size={12} /> Photo & Motion Twin</span>
            <span className="badge badge-purple">Natyashastra Standards</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Digital Twin Posture & Motion Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', maxWidth: '780px' }}>
            Multi-modal kinematic posture and dance video comparison: AI automatically classifies classical dance traditions, synchronizes continuous motion streams, and measures angular precision, rhythm consistency, and balance against canonical benchmarks.
          </p>
        </div>

        {/* Mode & Tradition Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <Sparkles size={18} color="var(--gold-dark)" />
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700 }}>
              Mode & Tradition
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--gold-dark)', fontWeight: 800 }}>
              {twinMode === 'photo' ? 'Photo Twin' : 'Motion Twin (Video)'} • {selectedTradition === 'auto' ? 'AI Auto-Detect' : selectedTradition}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Pills */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', border: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            Studio Mode:
          </span>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                setTwinMode('photo');
                setResult(null);
                setError('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                background: twinMode === 'photo' ? 'var(--grad-primary)' : 'transparent',
                color: twinMode === 'photo' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: twinMode === 'photo' ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Camera size={14} />
              <span>Photo Twin (Instant Posture)</span>
            </button>

            <button
              onClick={() => {
                setTwinMode('video');
                setResult(null);
                setError('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                background: twinMode === 'video' ? 'var(--grad-primary)' : 'transparent',
                color: twinMode === 'video' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: twinMode === 'video' ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Film size={14} />
              <span>Motion Twin (Dance Video Stream)</span>
            </button>
          </div>
        </div>

        <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
          {twinMode === 'photo' ? '✨ Instant anatomical 33-point posture comparison' : '🎥 Continuous temporal tracking, rhythm BPM & balance telemetry'}
        </span>
      </div>

      {/* Tradition Selector Tabs */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
            Select Target Tradition / Comparison Benchmark:
          </span>
          <span style={{ fontSize: '0.76rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
            {selectedTradition === 'auto' ? 'Auto-Detect will classify style from uploaded media' : `Comparing directly against ${selectedTradition} standards`}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {TRADITIONS.map((trad) => {
            const IconComponent = trad.icon;
            const isSelected = selectedTradition === trad.id;
            return (
              <button
                key={trad.id}
                onClick={() => {
                  setSelectedTradition(trad.id);
                  setResult(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--gold-bg)' : '#ffffff',
                  color: isSelected ? 'var(--gold-dark)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <IconComponent size={16} color={isSelected ? 'var(--gold-dark)' : 'var(--text-muted)'} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {trad.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MEDIA UPLOAD SECTION: PHOTO VS VIDEO
          ========================================================================= */}
      {twinMode === 'photo' ? (
        /* PHOTO UPLOAD GRID */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2rem' }}>
          
          {/* Left: Dancer Photo */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--gold-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--gold-dark)" />
                Your Posture Photo
              </h3>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                Shishya / Dancer Input
              </span>
            </div>

            <div 
              style={{
                border: '2px dashed var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => document.getElementById('user-photo-input').click()}
            >
              <input type="file" id="user-photo-input" style={{ display: 'none' }} accept="image/*" onChange={handleUserPhotoChange} />
              {userPhotoPreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img src={userPhotoPreviewUrl} alt="User Pose" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                  <button 
                    onClick={clearUserPhoto}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={32} color="var(--gold-dark)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Upload Your Dance Photo</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Full-body posture view (Camera or Gallery)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Master Reference Photo (Optional) */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--cyan-primary)" />
                Guru / Benchmark Reference Photo
              </h3>
              <span className="badge badge-peacock" style={{ fontSize: '0.72rem' }}>
                Reference Standard
              </span>
            </div>

            <div 
              style={{
                border: '2px dashed var(--border-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => document.getElementById('ref-photo-input').click()}
            >
              <input type="file" id="ref-photo-input" style={{ display: 'none' }} accept="image/*" onChange={handleRefPhotoChange} />
              {refPhotoPreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img src={refPhotoPreviewUrl} alt="Reference Pose" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                  <button 
                    onClick={clearRefPhoto}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <Sparkles size={32} color="var(--cyan-primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Upload Guru Reference Photo (Optional)</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    If empty, AI automatically benchmarks against canonical Natyashastra standards
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* VIDEO UPLOAD GRID */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2rem' }}>
          
          {/* Left: Dancer Video */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--gold-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} color="var(--gold-dark)" />
                Your Dance Performance Video
              </h3>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                Shishya Video Stream
              </span>
            </div>

            <div 
              style={{
                border: '2px dashed var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: userVideoPreviewUrl ? '0.5rem' : '2rem 1rem',
                textAlign: 'center',
                cursor: userVideoPreviewUrl ? 'default' : 'pointer',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => {
                if (!userVideoPreviewUrl) {
                  document.getElementById('user-video-input').click();
                }
              }}
            >
              <input type="file" id="user-video-input" style={{ display: 'none' }} accept="video/*" onChange={handleUserVideoChange} />
              {userVideoPreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <video 
                    src={userVideoPreviewUrl} 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '230px', borderRadius: 'var(--radius-sm)', background: '#000000' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '8px', padding: '0 4px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {userVideoFile?.name} ({userVideoFile ? (userVideoFile.size / (1024 * 1024)).toFixed(1) : 0} MB)
                    </span>
                    <button 
                      onClick={clearUserVideo}
                      style={{ background: 'rgba(239, 68, 68, 0.85)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 'bold' }}
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Film size={34} color="var(--gold-dark)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Upload Dancer Video Stream</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    MP4, WebM, MOV, AVI (Full body visible, recommended 5-60s)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Master Reference Video (Optional) */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--cyan-primary)" />
                Guru / Reference Video Standard
              </h3>
              <span className="badge badge-peacock" style={{ fontSize: '0.72rem' }}>
                Reference Stream
              </span>
            </div>

            <div 
              style={{
                border: '2px dashed var(--border-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: refVideoPreviewUrl ? '0.5rem' : '2rem 1rem',
                textAlign: 'center',
                cursor: refVideoPreviewUrl ? 'default' : 'pointer',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => {
                if (!refVideoPreviewUrl) {
                  document.getElementById('ref-video-input').click();
                }
              }}
            >
              <input type="file" id="ref-video-input" style={{ display: 'none' }} accept="video/*" onChange={handleRefVideoChange} />
              {refVideoPreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <video 
                    src={refVideoPreviewUrl} 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '230px', borderRadius: 'var(--radius-sm)', background: '#000000' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '8px', padding: '0 4px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {refVideoFile?.name} ({refVideoFile ? (refVideoFile.size / (1024 * 1024)).toFixed(1) : 0} MB)
                    </span>
                    <button 
                      onClick={clearRefVideo}
                      style={{ background: 'rgba(239, 68, 68, 0.85)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 'bold' }}
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Sparkles size={34} color="var(--cyan-primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Upload Guru Video Standard (Optional)</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    If empty, AI automatically benchmarks against canonical Natyashastra motion standard
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}


      {/* Compare Action Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={twinMode === 'photo' ? handlePhotoCompare : handleVideoCompare}
          disabled={isAnalyzing || (twinMode === 'photo' ? (!userPhotoFile && !refPhotoFile) : (!userVideoFile && !refVideoFile))}
          className={twinMode === 'photo' ? 'btn-primary' : 'btn-cyan'}
          style={{ padding: '14px 44px', fontSize: '1.05rem', minWidth: '320px' }}
        >
          {isAnalyzing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
              <span>
                {twinMode === 'photo' 
                  ? 'Predicting Style & Computing Kinematic Angles...' 
                  : uploadProgress > 0 && uploadProgress < 100 
                    ? `Uploading Video Stream (${uploadProgress}%)...` 
                    : 'Processing 33-Keypoint Motion & Rhythm Telemetry...'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {twinMode === 'photo' ? <SplitSquareHorizontal size={18} /> : <Film size={18} />}
              <span>{twinMode === 'photo' ? 'Run Photo Digital Twin Analysis' : 'Run Motion Twin Video Analysis'}</span>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.35)', fontSize: '0.88rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* =========================================================================
          RESULTS SECTION: PHOTO & VIDEO DIGITAL TWIN
          ========================================================================= */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
          
          {/* CASUAL / NON-DANCE POSTURE DETECTED ALERT BANNER */}
          {(result.is_classical_dancer === false || result.user_prediction?.is_classical_posture === false) && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              <AlertCircle size={32} color="#fb7185" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fb7185' }}>
                    Casual / Everyday Posture Detected ({result.predicted_confidence ?? result.user_prediction?.confidence ?? 0}% Dance Correlation)
                  </span>
                  <span className="badge badge-maroon" style={{ fontSize: '0.7rem' }}>
                    Non-Classical Stance
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The uploaded media appears to be a casual non-dance stance rather than an authentic classical posture or continuous dance movement. The Digital Twin has mapped your current joints against the closest classical benchmark (<strong>{result.dance_form} — {result.detected_canonical_pose || result.pose_name}</strong>) to show what kinematic adjustments are needed.
                </div>
              </div>
            </div>
          )}

          {/* 1. COMPARATIVE DANCE FORM PREDICTION CARD */}
          <div className="glass-panel" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--gold-primary)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold">
                    <Sparkles size={12} /> Dance Form Prediction
                  </span>
                  {result.dance_forms_match ? (
                    <span className="badge badge-emerald">
                      <CheckCircle2 size={12} /> Classical Tradition Aligned
                    </span>
                  ) : (
                    <span className="badge badge-rose">
                      <AlertCircle size={12} /> Cross-Tradition Benchmark
                    </span>
                  )}
                  {result.video_metadata && (
                    <span className="badge badge-peacock">
                      <Film size={11} /> {result.video_metadata.processed_frames} Frames Analyzed ({result.video_metadata.duration_seconds}s @ {result.video_metadata.fps} FPS)
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                  {result.dance_form} Standard
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '680px' }}>
                  {result.comparison_summary || `Movement classified and compared against ${result.dance_form} benchmarks.`}
                </p>
              </div>

              <div style={{ textAlign: 'right', background: '#f8fafc', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700 }}>
                  Classification Confidence
                </span>
                <span style={{ 
                  fontSize: '2rem', 
                  color: (result.predicted_confidence ?? result.user_prediction?.confidence ?? 0) >= 75 
                    ? 'var(--emerald-primary)' 
                    : (result.predicted_confidence ?? result.user_prediction?.confidence ?? 0) >= 50 
                      ? 'var(--gold-dark)' 
                      : 'var(--rose-primary)', 
                  fontWeight: 800 
                }}>
                  {result.predicted_confidence ?? result.user_prediction?.confidence ?? 0}%
                </span>
              </div>
            </div>

            {/* If both User and Reference are uploaded: Show Side-by-Side Prediction Matrix */}
            {result.reference_prediction && result.user_prediction && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                
                {/* Dancer Prediction Card */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid #fde68a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Dancer Motion Classification
                    </span>
                    <span className={`badge ${result.user_prediction.confidence >= 75 ? 'badge-emerald' : result.user_prediction.confidence >= 50 ? 'badge-gold' : 'badge-maroon'}`} style={{ fontSize: '0.72rem' }}>
                      {result.user_prediction.confidence}% Confidence
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {result.user_prediction.predicted_dance}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                    <MapPin size={13} color="var(--gold-dark)" />
                    <span>{result.user_prediction.origin || 'India'}</span>
                  </div>
                  {result.user_prediction.primary_stance && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Stance / Motion:</strong> {result.user_prediction.primary_stance}
                    </p>
                  )}
                </div>

                {/* Reference Prediction Card */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Guru Reference Classification
                    </span>
                    <span className="badge badge-peacock" style={{ fontSize: '0.72rem' }}>
                      {result.reference_prediction.confidence}% Confidence
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {result.reference_prediction.predicted_dance}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                    <MapPin size={13} color="var(--cyan-primary)" />
                    <span>{result.reference_prediction.origin || 'India'}</span>
                  </div>
                  {result.reference_prediction.primary_stance && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Stance / Motion:</strong> {result.reference_prediction.primary_stance}
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* 5-Classical Style Probability Breakdown */}
            {result.user_prediction?.class_probabilities && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
                  Multi-Class Stylistic Resonance Spectrum:
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(result.user_prediction.class_probabilities).map(([cname, prob]) => {
                    const isWinning = cname.toLowerCase() === (result.user_prediction.predicted_dance || '').toLowerCase();
                    return (
                      <div key={cname} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '130px', fontSize: '0.84rem', color: isWinning ? 'var(--gold-dark)' : 'var(--text-secondary)', fontWeight: isWinning ? 800 : 500 }}>
                          {cname}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${prob}%`, 
                              height: '100%', 
                              background: isWinning ? 'var(--grad-gold)' : 'linear-gradient(90deg, #3b82f6 0%, #0ea5e9 100%)',
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.6s ease-out'
                            }} 
                          />
                        </div>
                        <span style={{ width: '45px', textAlign: 'right', fontSize: '0.82rem', color: isWinning ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: 700 }}>
                          {prob}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* 2. OVERALL KINEMATIC POSTURE ACCURACY & CANONICAL STANDARD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Score Card */}
            {(() => {
              const matchPct = result.overall_match_percentage ?? result.similarity_score ?? 0;
              const matchColor = matchPct >= 75 ? 'var(--emerald-primary)' : matchPct >= 50 ? 'var(--gold-dark)' : 'var(--rose-primary)';
              const matchGrad = matchPct >= 75 ? 'var(--grad-emerald)' : matchPct >= 50 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)';
              const badgeClass = matchPct >= 75 ? 'badge-emerald' : matchPct >= 50 ? 'badge-gold' : 'badge-maroon';
              const badgeLabel = matchPct >= 75 ? 'Kinematic Precision Optimal' : matchPct >= 50 ? 'Moderate Kinematic Conformity' : 'Low Kinematic Conformity / Casual Stance';

              return (
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: `4px solid ${matchColor}` }}>
                  <div>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: '0.74rem', marginBottom: '0.5rem' }}>
                      {badgeLabel}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                      {result.video_metadata ? 'Motion Match Accuracy' : 'Posture Match Accuracy'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
                      Measured across 33 MediaPipe skeletal joint angles against ideal anatomical vectors.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '1.5rem 0' }}>
                    <span style={{ fontSize: '3.5rem', color: matchColor, fontWeight: 900, lineHeight: 1 }}>
                      {matchPct}%
                    </span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      / 100%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${matchPct}%`, 
                        height: '100%', 
                        background: matchGrad,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s ease-out'
                      }} 
                    />
                  </div>
                </div>
              );
            })()}

            {/* Canonical Natyashastra Posture Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--purple-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                  Canonical Standard Identified
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--purple-primary)', fontWeight: 700 }}>
                  Natyashastra Treatise
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                  {result.detected_canonical_pose || result.pose_name || 'Canonical Posture'}
                </h3>
                <span style={{ fontSize: '0.84rem', color: 'var(--gold-dark)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  Classical {result.dance_form} Benchmark
                </span>
              </div>

              {result.pose_description && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {result.pose_description}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* 3. VIDEO RHYTHM, LAYA & BALANCE TELEMETRY (If Video Mode) */}
          {result.rhythm_metrics && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--indigo-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Music size={18} color="var(--indigo-primary)" />
                  Rhythm, Laya & Dynamic Balance Telemetry
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                  Tala Speed & Stance Stability
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                
                {/* Tempo / BPM Card */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Estimated Tempo
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0' }}>
                    <span style={{ fontSize: '1.85rem', color: 'var(--gold-dark)', fontWeight: 900 }}>
                      {result.rhythm_metrics.dancer_bpm}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      BPM
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    Reference: {result.rhythm_metrics.reference_bpm} BPM (±{result.rhythm_metrics.bpm_deviation} diff)
                  </span>
                </div>

                {/* Rhythm Consistency Card */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Rhythm Consistency
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0' }}>
                    <span style={{ fontSize: '1.85rem', color: 'var(--emerald-primary)', fontWeight: 900 }}>
                      {result.rhythm_metrics.rhythm_consistency_score}%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                    Laya: <strong>{result.rhythm_metrics.laya_category}</strong>
                  </span>
                </div>

                {/* Balance Stability Card */}
                {result.balance_metrics && (
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Dynamic Balance Stability
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0' }}>
                      <span style={{ fontSize: '1.85rem', color: result.balance_metrics.balance_score >= 70 ? 'var(--emerald-primary)' : 'var(--gold-dark)', fontWeight: 900 }}>
                        {result.balance_metrics.balance_score}%
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                      Status: <strong>{result.balance_metrics.stability_status}</strong> (drift: {result.balance_metrics.center_of_gravity_drift})
                    </span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 4. VISUAL TELEMETRY: VIDEO STREAM PLAYER OR COMPOSITE IMAGES */}
          {result.composite_video_url ? (
            /* VIDEO STREAM PLAYER */
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Film size={18} color="var(--cyan-primary)" />
                    Annotated Motion Twin Video Playback
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    {result.video_metadata?.comparison_mode === 'dual_video' 
                      ? 'Synchronized Side-by-Side [Guru Standard | Dancer Stream] with 33-Keypoint HUD' 
                      : 'Full-Body Annotated Motion Stream with Live Natyashastra Accuracy Telemetry'}
                  </span>
                </div>

                <a 
                  href={getFullMediaUrl(result.composite_video_url)} 
                  download="motion_twin_analysis.mp4" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <Download size={14} />
                  <span>Download Video</span>
                </a>
              </div>

              {/* Video Player */}
              <div style={{ background: '#000000', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <video 
                  src={getFullMediaUrl(result.composite_video_url)} 
                  controls 
                  autoPlay
                  loop
                  muted
                  style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
            </div>
          ) : (result.composite_image_url || result.user_annotated_url || result.reference_annotated_url) && (
            /* PHOTO COMPOSITE & SKELETON VIEWS */
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={18} color="var(--cyan-primary)" />
                    Digital Twin Visual Telemetry
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Side-by-side visual alignment and annotated skeletal keypoints.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {result.composite_image_url && (
                    <button
                      onClick={() => setActiveTelemetryTab('composite')}
                      className={activeTelemetryTab === 'composite' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    >
                      Side-by-Side View
                    </button>
                  )}
                  {result.user_annotated_url && (
                    <button
                      onClick={() => setActiveTelemetryTab('skeletons')}
                      className={activeTelemetryTab === 'skeletons' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    >
                      33-Keypoint Overlay
                    </button>
                  )}
                </div>
              </div>

              {/* Composite Image View */}
              {activeTelemetryTab === 'composite' && result.composite_image_url && (
                <div style={{ background: '#000000', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                  <img 
                    src={getFullMediaUrl(result.composite_image_url)} 
                    alt="Guru-Shishya Composite Alignment" 
                    style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
                  />
                </div>
              )}

              {/* Skeletons View */}
              {activeTelemetryTab === 'skeletons' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {result.user_annotated_url && (
                    <div style={{ background: '#000000', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                        Dancer Keypoint Telemetry
                      </span>
                      <img 
                        src={getFullMediaUrl(result.user_annotated_url)} 
                        alt="Dancer Skeletal Annotation" 
                        style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
                      />
                    </div>
                  )}
                  {result.reference_annotated_url && (
                    <div style={{ background: '#000000', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--cyan-primary)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                        Reference Keypoint Telemetry
                      </span>
                      <img 
                        src={getFullMediaUrl(result.reference_annotated_url)} 
                        alt="Reference Skeletal Annotation" 
                        style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
                      />
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* 5. JOINT-BY-JOINT ANGULAR TELEMETRY BREAKDOWN */}
          {result.angular_deviations && Object.keys(result.angular_deviations).length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--gold-dark)" />
                  Kinematic Joint Angular Deviations
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                    Approximation Values (±3°–5°)
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {result.video_metadata ? 'Temporal frame averages calibrated to Natyashastra geometry' : 'Tolerances calibrated to classical Natyashastra geometry'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {Object.entries(result.angular_deviations).map(([joint, diff]) => {
                  const rawUserAngle = result.user_angles?.[joint];
                  const rawRefAngle = result.reference_angles?.[joint] || result.ideal_angles?.[joint];
                  const userAngle = rawUserAngle !== undefined && rawUserAngle !== '-' ? `~${Math.round(Number(rawUserAngle))}` : '-';
                  const refAngle = rawRefAngle !== undefined && rawRefAngle !== '-' ? `~${Math.round(Number(rawRefAngle))}` : '-';
                  const status = result.joint_status?.[joint] || (diff <= 12 ? 'green' : diff <= 24 ? 'yellow' : 'red');
                  const jointScore = result.joint_scores?.[joint] || Math.max(0, Math.round(100 - diff * 1.6));

                  const badgeClass = status === 'green' ? 'badge-emerald' : status === 'yellow' ? 'badge-gold' : 'badge-maroon';
                  const statusLabel = status === 'green' ? 'Optimal' : status === 'yellow' ? 'Minor Deviation' : 'Needs Correction';

                  return (
                    <div 
                      key={joint} 
                      style={{ 
                        background: '#f8fafc', 
                        padding: '1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'capitalize' }}>
                          {joint.replace('_', ' ')}
                        </span>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          {statusLabel}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Dancer</span>
                          <span style={{ fontSize: '0.96rem', color: 'var(--text-primary)', fontWeight: 800 }}>{userAngle}°</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Deviation</span>
                          <span style={{ fontSize: '0.92rem', color: status === 'green' ? 'var(--emerald-primary)' : status === 'yellow' ? 'var(--gold-dark)' : 'var(--rose-primary)', fontWeight: 800 }}>
                            ±{diff}°
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Benchmark</span>
                          <span style={{ fontSize: '0.96rem', color: 'var(--cyan-primary)', fontWeight: 800 }}>{refAngle}°</span>
                        </div>
                      </div>

                      <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '4px' }}>
                        <div 
                          style={{ 
                            width: `${jointScore}%`, 
                            height: '100%', 
                            background: status === 'green' ? 'var(--emerald-primary)' : status === 'yellow' ? 'var(--gold-primary)' : 'var(--rose-primary)',
                            borderRadius: 'var(--radius-full)'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', background: '#f1f5f9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                ℹ️ Note: All degree values for knees, shoulders, wrists, elbows, and hips are kinematic approximations (±3°–5° tolerance) calculated from MediaPipe 33-point skeletal geometry.
              </div>
            </div>
          )}

          {/* 6. GURU PEDAGOGICAL DIRECTIVES & FEEDBACK */}
          {result.feedback && result.feedback.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--gold-dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--gold-dark)" />
                  Guru Pedagogical Directives & Corrections
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  AI Natya Shastra Guidance
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.feedback.map((fb, idx) => {
                  const isTip = fb.includes('Guru Tip') || fb.includes('Canonical') || fb.includes('Rhythm');
                  const isSuccess = fb.includes('Splendid') || fb.includes('High precision');
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px', 
                        fontSize: '0.9rem', 
                        color: isSuccess ? 'var(--emerald-primary)' : isTip ? 'var(--gold-dark)' : 'var(--text-secondary)',
                        background: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: isTip ? '1px solid #fde68a' : isSuccess ? '1px solid #a7f3d0' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={18} color="var(--emerald-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : isTip ? (
                        <Sparkles size={18} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <ArrowRight size={18} color="var(--cyan-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span style={{ lineHeight: 1.5 }}>{fb}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        </div>
      )}

    </div>
  );
}
