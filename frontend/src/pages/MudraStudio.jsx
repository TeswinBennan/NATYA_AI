import React, { useState, useRef, useEffect } from 'react';
import { 
  Hand, Camera, Upload, CheckCircle, AlertTriangle, XCircle, 
  Search, Activity, Sparkles, BookOpen, ChevronRight, Zap, RefreshCw, Layers, Info, ShieldCheck
} from 'lucide-react';
import api, { getAsamyutaHastasList, getSamyutaHastasList, classifyMudraImage, API_BASE_URL } from '../services/api';

export default function MudraStudio() {
  const [activeTab, setActiveTab] = useState('asamyuta'); // 'asamyuta' | 'samyuta'
  const [analysisMode, setAnalysisMode] = useState('auto'); // 'auto' | 'target'
  const [mudraList, setMudraList] = useState([]);
  const [selectedMudra, setSelectedMudra] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Live Camera
  const [cameraMode, setCameraMode] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchMudras();
    return () => stopCamera();
  }, [activeTab]);

  const fetchMudras = async () => {
    try {
      if (activeTab === 'asamyuta') {
        const res = await getAsamyutaHastasList();
        setMudraList(res.hastas || []);
        if (res.hastas && res.hastas.length > 0 && !selectedMudra) {
          setSelectedMudra(res.hastas[0]);
        }
      } else {
        const res = await getSamyutaHastasList();
        setMudraList(res.hastas || []);
        if (res.hastas && res.hastas.length > 0 && !selectedMudra) {
          setSelectedMudra(res.hastas[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching mudras:', err);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedMudra(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const startCamera = async () => {
    try {
      setCameraMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Unable to access webcam. Please verify camera permissions.');
      setCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'webcam_mudra.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    });
  };

  const handleAnalyze = async (overrideMudra = null) => {
    let fileToUpload = selectedFile;
    if (cameraMode) {
      fileToUpload = await captureCameraFrame();
    }

    let targetMudraParam = null;
    if (analysisMode === 'target' || overrideMudra) {
      targetMudraParam = overrideMudra?.name || selectedMudra?.name || '';
    }

    setIsAnalyzing(true);
    setError('');

    try {
      if (fileToUpload) {
        const data = await classifyMudraImage(fileToUpload, targetMudraParam, activeTab === 'asamyuta' ? 'single' : 'double');
        setResult(data);
        if (data.detected_mudra_name || data.mudra_name) {
          const detectedName = data.detected_mudra_name || data.mudra_name;
          const matchedInList = mudraList.find(m => m.name.toLowerCase() === detectedName.toLowerCase());
          if (matchedInList) setSelectedMudra(matchedInList);
        }
      } else {
        // Sample preview when no photo uploaded yet
        setResult({
          mudra_name: selectedMudra?.name || 'Pataka',
          auto_detected_mudra: selectedMudra?.name || 'Pataka',
          overall_accuracy: 94.5,
          english_meaning: selectedMudra?.english_meaning || 'Open Palm Flag',
          symbolism: selectedMudra?.symbolism || 'Clouds, Forest, Waves, Peace',
          finger_configuration: selectedMudra?.finger_configuration || 'All four fingers extended straight, thumb tucked inward touching index base.',
          usage: selectedMudra?.usage || 'Depicting clouds, dense forests, ocean waves, peace, and blessing gestures.',
          top_predictions: [
            { mudra_name: selectedMudra?.name || 'Pataka', score: 94.5 },
            { mudra_name: 'Tripataka', score: 78.2 },
            { mudra_name: 'Alapadma', score: 62.1 }
          ],
          finger_corrections: [
            { finger: "Thumb", user_angle: "44°", target_angle: "45°", deviation: "1.0°", score: 98.5, status: "Optimal", status_color: "green", directive: "Optimal extension (44° matches target 45°)." },
            { finger: "Index", user_angle: "172°", target_angle: "175°", deviation: "3.0°", score: 95.5, status: "Optimal", status_color: "green", directive: "Optimal extension (172° matches target 175°)." },
            { finger: "Middle", user_angle: "174°", target_angle: "175°", deviation: "1.0°", score: 98.0, status: "Optimal", status_color: "green", directive: "Optimal extension (174° matches target 175°)." },
            { finger: "Ring", user_angle: "170°", target_angle: "175°", deviation: "5.0°", score: 92.0, status: "Optimal", status_color: "green", directive: "Slight curve (170° vs 175° target)." },
            { finger: "Pinky", user_angle: "173°", target_angle: "175°", deviation: "2.0°", score: 97.0, status: "Optimal", status_color: "green", directive: "Optimal alignment (173° matches target 175°)." }
          ],
          pedagogical_directives: [
            "Abhinaya Darpana: Maintain fingers joined seamlessly without gaps.",
            "Keep thumb gently curved inward against the index knuckle base."
          ]
        });
      }
    } catch (err) {
      console.error('Mudra classification error:', err);
      setError('Analysis failed. Please verify the backend service is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredList = mudraList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.english_meaning && m.english_meaning.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '5px solid var(--gold-primary)',
          background: '#ffffff',
          border: '1px solid var(--border-card)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><Sparkles size={12} /> 21-Point Joint Tracking</span>
            <span className="badge badge-emerald">52 Mudra Lexicon</span>
            <span className="badge badge-peacock">Ensemble AI (Kaggle + Shastra)</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Classical Mudra & Hand Gesture Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '720px' }}>
            21-point hand joint tracking, finger angle deviations, and real-time mudra identification.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', gap: '4px' }}>
          <button
            onClick={() => handleTabSwitch('asamyuta')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'asamyuta' ? 700 : 500,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'asamyuta' ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === 'asamyuta' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Hand size={14} /> Asamyuta (28 Single)
          </button>
          
          <button
            onClick={() => handleTabSwitch('samyuta')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'samyuta' ? 700 : 500,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'samyuta' ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === 'samyuta' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} /> Samyuta (24 Double)
          </button>
        </div>
      </div>

      {/* Main Studio Grid: 2 Equal, Symmetrical, Gap-Free Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: GESTURE CAPTURE & MUDRA REFERENCE LEXICON    */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Capture & Mode Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '3px solid var(--gold-light)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <button
                onClick={() => setAnalysisMode('auto')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: analysisMode === 'auto' ? 'var(--grad-primary)' : 'transparent',
                  color: analysisMode === 'auto' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={13} /> Auto-Detect
              </button>
              <button
                onClick={() => setAnalysisMode('target')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: analysisMode === 'target' ? 'var(--grad-primary)' : 'transparent',
                  color: analysisMode === 'target' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={13} /> Practice Target
              </button>
            </div>

            {/* Live Camera or Upload Image Viewport */}
            {cameraMode ? (
              <div style={{ position: 'relative', width: '100%', height: '260px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#0f172a', border: '1px solid var(--border-card)' }}>
                <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255, 255, 255, 0.95)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 700, border: '1px solid var(--border-card)' }}>
                  {analysisMode === 'auto' ? 'Mode: Auto-Detect Hand' : `Target: ${selectedMudra?.name || 'Mudra'}`}
                </div>
              </div>
            ) : (
              <div 
                style={{
                  border: '2px dashed var(--border-accent)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.75rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  minHeight: '210px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  position: 'relative'
                }}
                onClick={() => document.getElementById('mudra-file-input').click()}
              >
                <input type="file" id="mudra-file-input" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    <img src={previewUrl} alt="Mudra Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="var(--gold-light)" style={{ margin: '0 auto 0.6rem' }} />
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.94rem', margin: 0 }}>Click or Drop Hand Gesture Photo</p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      JPG, PNG, WebP with clear hand visibility
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || (!selectedFile && !cameraMode)}
                className="btn-primary"
                style={{ flex: 1, padding: '11px', fontSize: '0.92rem' }}
              >
                {isAnalyzing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    <span>Classifying 21 Hand Joints...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} />
                    <span>{cameraMode ? 'Capture & Analyze Gesture' : 'Analyze Mudra Gesture'}</span>
                  </div>
                )}
              </button>

              {!cameraMode ? (
                <button
                  onClick={startCamera}
                  className="btn-secondary"
                  style={{ padding: '11px 16px', fontSize: '0.86rem', gap: '6px' }}
                  title="Use Live Webcam"
                >
                  <Camera size={16} />
                  <span>Webcam</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="btn-secondary"
                  style={{ padding: '11px 16px', fontSize: '0.86rem', color: 'var(--rose-primary)' }}
                >
                  Cancel
                </button>
              )}
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--rose-bg)', color: 'var(--rose-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.86rem' }}>
                {error}
              </div>
            )}
          </div>

          {/* 2. Classical Hasta Reference Directory */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--gold-light)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                  {activeTab === 'asamyuta' ? '28 Asamyuta Hastas' : '24 Samyuta Hastas'}
                </span>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                  Classical Shastra Directory
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {filteredList.length} Available
              </span>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '34px', height: '38px', fontSize: '0.86rem', background: '#ffffff', color: 'var(--text-primary)', borderColor: '#cbd5e1' }}
                placeholder={`Search ${activeTab === 'asamyuta' ? '28 single' : '24 double'} mudras...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
            </div>

            {/* Mudra Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '7px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredList.map((m) => {
                const isSelected = selectedMudra?.name.toLowerCase() === m.name.toLowerCase();
                return (
                  <button
                    key={m.id || m.name}
                    onClick={() => {
                      setSelectedMudra(m);
                      if (analysisMode === 'target') {
                        handleAnalyze(m);
                      }
                    }}
                    style={{
                      padding: '8px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--gold-light)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--gold-bg)' : '#f8fafc',
                      color: isSelected ? 'var(--gold-dark)' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>

            {/* Quick Mudra Info Card */}
            {selectedMudra && (
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                    {selectedMudra.name}
                  </h4>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {selectedMudra.english_meaning}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {selectedMudra.finger_configuration || selectedMudra.description || 'Finger formation.'}
                </p>
              </div>
            )}

          </div>

          {/* 3. Natyashastra Postural Principles Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '4px solid var(--cyan-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> Natyashastra Biomechanical Standards
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Wrist Elevation:</strong> Align wrist parallel to elbow without downward droop.</li>
              <li><strong>Finger Extension:</strong> Maintain extension tension in straight fingers.</li>
              <li><strong>Thumb Placement:</strong> Tuck thumb against index knuckle for flat palm mudras.</li>
            </ul>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: DYNAMIC TELEMETRY & KINEMATIC ANALYSIS      */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Mudra Shloka & Usage Overview */}
          {selectedMudra && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--gold-light)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="badge badge-gold" style={{ fontSize: '0.74rem', marginBottom: '0.35rem' }}>
                    {activeTab === 'asamyuta' ? 'Asamyuta Hasta' : 'Samyuta Hasta'}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {selectedMudra.name}
                  </h3>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {selectedMudra.english_meaning}
                  </span>
                </div>

                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 600 }}>
                    Mudra Index
                  </span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--gold-dark)', fontWeight: 800, fontFamily: 'monospace' }}>
                    #{selectedMudra.id || selectedMudra.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Shloka description */}
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--gold-dark)' }}>Formation:</strong> {selectedMudra.finger_configuration || selectedMudra.description || 'Finger formation.'}
                </p>
                {selectedMudra.usage && (
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--cyan-primary)' }}>Usage (Viniyoga):</strong> {selectedMudra.usage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI Result Card */}
          {result ? (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: result.has_hand_detected === false ? '3px solid var(--rose-primary)' : '3px solid var(--emerald-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
              
              {result.has_hand_detected === false && (
                <div style={{ padding: '10px 14px', background: 'var(--rose-bg)', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', color: 'var(--rose-primary)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="var(--rose-primary)" style={{ flexShrink: 0 }} />
                  <span><strong>Hand Visibility Note:</strong> Hand was not clearly framed. Please center your hand with clear lighting.</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className={result.has_hand_detected === false ? "badge badge-maroon" : "badge badge-emerald"} style={{ fontSize: '0.74rem' }}>
                      {result.has_hand_detected === false ? <AlertTriangle size={12} /> : <CheckCircle size={12} />} 
                      {result.has_hand_detected === false ? 'Low Hand Visibility' : `AI Recognized: ${result.detected_mudra_name || result.mudra_name}`}
                    </span>
                    {result.target_mudra_name && (
                      <span className={result.is_target_matched ? "badge badge-gold" : "badge badge-amber"} style={{ fontSize: '0.74rem' }}>
                        Target: {result.target_mudra_name} {result.is_target_matched ? '✓ Match' : '≠ Different Form'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {result.detected_mudra_name || result.mudra_name || result.auto_detected_mudra}
                  </h3>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    {result.english_meaning}
                  </span>
                </div>

                {(() => {
                  const mudraScore = result.overall_accuracy ?? result.confidence ?? 0;
                  const mudraColor = mudraScore >= 75 ? 'var(--emerald-primary)' : mudraScore >= 50 ? 'var(--gold-dark)' : 'var(--rose-primary)';
                  const mudraBg = mudraScore >= 75 ? 'var(--emerald-bg)' : mudraScore >= 50 ? 'var(--gold-bg)' : 'var(--rose-bg)';
                  const mudraBorder = mudraScore >= 75 ? '#a7f3d0' : mudraScore >= 50 ? '#fde68a' : '#fecaca';
                  return (
                    <div style={{ textAlign: 'right', background: mudraBg, padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: `1px solid ${mudraBorder}` }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 600 }}>
                        Prediction Match
                      </span>
                      <span style={{ fontSize: '1.5rem', color: mudraColor, fontWeight: 800 }}>
                        {mudraScore}%
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Annotated Skeleton Image if available */}
              {result.annotated_url && (
                <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-card)', background: '#0f172a' }}>
                  <img 
                    src={`${API_BASE_URL}${result.annotated_url}`} 
                    alt="Mudra Skeleton Alignment" 
                    style={{ width: '100%', maxHeight: '270px', objectFit: 'contain', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255, 255, 255, 0.95)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700, border: '1px solid var(--border-card)' }}>
                    21-Point Skeletal Joint Tracking
                  </div>
                </div>
              )}

              {/* Top Ranked Predictions */}
              {result.top_predictions && result.top_predictions.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Top Recognized Mudra Candidates
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {result.top_predictions.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? 'var(--gold-dark)' : 'var(--text-secondary)', minWidth: '110px' }}>
                          {idx + 1}. {p.mudra_name}
                        </span>
                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Math.max(5, p.score))}%`, background: idx === 0 ? 'var(--emerald-primary)' : '#94a3b8', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: idx === 0 ? 'var(--emerald-primary)' : 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                          {p.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finger Corrections Grid */}
              {result.finger_corrections && result.finger_corrections.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Finger Joint Angular Precision Telemetry
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '8px' }}>
                    {result.finger_corrections.map((fc, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          padding: '10px', 
                          background: fc.status_color === 'green' ? 'var(--emerald-bg)' : 'var(--rose-bg)', 
                          borderRadius: 'var(--radius-sm)', 
                          border: `1px solid ${fc.status_color === 'green' ? '#a7f3d0' : '#fecaca'}` 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span style={{ color: 'var(--text-primary)' }}>{fc.finger}</span>
                          <span style={{ color: fc.status_color === 'green' ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>{fc.user_angle}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Target: <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>{fc.target_angle}</span> • Dev: {fc.deviation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedagogical Corrections / Shastra Directives */}
              {result.pedagogical_directives && result.pedagogical_directives.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--gold-light)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Natyashastra Pedagogical Corrections
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {result.pedagogical_directives.map((dir, dIdx) => (
                      <li key={dIdx}>{dir}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            /* Standby Card when no analysis yet */
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '3px solid var(--gold-light)', background: '#ffffff', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--gold-bg)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <Hand size={26} color="var(--gold-dark)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                Ready for AI Gesture Analysis
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                Upload an image or start the live camera on the left to extract 21 joint landmarks, analyze finger deviations, and verify conformance with *Abhinaya Darpana*.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
