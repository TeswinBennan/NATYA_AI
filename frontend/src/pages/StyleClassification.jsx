import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  ChevronRight, 
  Activity, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Info,
  Video, 
  Hand, 
  Compass, 
  MapPin, 
  Camera, 
  Film, 
  Layers, 
  Sliders 
} from 'lucide-react';
import { predictDanceImage, predictDanceVideo, API_BASE_URL } from '../services/api';

const SAMPLE_STYLES = [
  { name: 'Bharatanatyam', origin: 'Tamil Nadu', feature: 'Aramandi & Natyarambha' },
  { name: 'Kathak', origin: 'North India', feature: 'Chakkars & Tatkar' },
  { name: 'Kathakali', origin: 'Kerala', feature: 'Heroic Stance & Expansive Mudras' },
  { name: 'Kuchipudi', origin: 'Andhra Pradesh', feature: 'Tarangam & Lyrical Wave' },
  { name: 'Mohiniyattam', origin: 'Kerala', feature: 'Lasya & Kasavu Saree' }
];

export default function StyleClassification() {
  const navigate = useNavigate();
  const [classificationMode, setClassificationMode] = useState('photo'); // 'photo' | 'video'

  // PHOTO STATE
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageError, setImageError] = useState(null);

  // VIDEO STATE
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState(null);

  // PHOTO HANDLERS
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageResult(null);
      setImageError(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzingImage(true);
    setImageError(null);

    try {
      const response = await predictDanceImage(selectedImage);
      if (response && response.success) {
        setImageResult(response);
      } else {
        setImageError(response?.message || 'Classification did not return valid results.');
      }
    } catch (err) {
      console.error('Classification error:', err);
      setImageError(err.response?.data?.detail || 'Classification failed. Please verify the backend is running.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageResult(null);
    setImageError(null);
  };

  // VIDEO HANDLERS
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setVideoResult(null);
      setVideoError(null);
      setVideoProgress(0);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) return;

    setIsAnalyzingVideo(true);
    setVideoError(null);
    setVideoProgress(15);

    try {
      const response = await predictDanceVideo(selectedVideo, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setVideoProgress(Math.min(95, Math.max(15, percent)));
        }
      });
      if (response && response.success) {
        setVideoProgress(100);
        setVideoResult(response);
      } else {
        setVideoError(response?.message || 'Video style prediction did not return valid results.');
      }
    } catch (err) {
      console.error('Video prediction error:', err);
      setVideoError(err.response?.data?.detail || 'Video classification failed. Please verify video format and backend connection.');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  const handleClearVideo = () => {
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setVideoResult(null);
    setVideoError(null);
    setVideoProgress(0);
  };

  const activeResult = classificationMode === 'photo' ? imageResult : videoResult;
  const isAnalyzing = classificationMode === 'photo' ? isAnalyzingImage : isAnalyzingVideo;

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
            <span className="badge badge-gold"><Sparkles size={12} /> Deep Vision AI</span>
            <span className="badge badge-emerald"><CheckCircle2 size={12} /> Multi-Frame Temporal Inference</span>
            <span className="badge badge-peacock">5 Classical Traditions</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Classical Dance Style Classifier
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', maxWidth: '680px' }}>
            Deep learning visual & video classifier identifying classical tradition, stance geometry, and attire style across static photos and video performances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/analyze')}
            className="btn-secondary"
            style={{ fontSize: '0.9rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={16} />
            <span>Kinematic Studio</span>
          </button>
          <button 
            onClick={() => navigate('/digital-twin')}
            className="btn-secondary"
            style={{ fontSize: '0.9rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={16} />
            <span>Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs (Photo vs Video) */}
      <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', width: 'fit-content' }}>
        <button
          onClick={() => setClassificationMode('photo')}
          style={{
            padding: '7px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: classificationMode === 'photo' ? 700 : 500,
            cursor: 'pointer',
            background: classificationMode === 'photo' ? 'var(--grad-primary)' : 'transparent',
            color: classificationMode === 'photo' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Camera size={14} />
          <span>Photo Classifier</span>
        </button>
        <button
          onClick={() => setClassificationMode('video')}
          style={{
            padding: '7px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: classificationMode === 'video' ? 700 : 500,
            cursor: 'pointer',
            background: classificationMode === 'video' ? 'var(--grad-primary)' : 'transparent',
            color: classificationMode === 'video' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Film size={14} />
          <span>Video Performance Classifier</span>
        </button>
      </div>

      {/* Main Grid: Upload vs Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* ========================================================
            UPLOAD COLUMN (PHOTO OR VIDEO)
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: classificationMode === 'photo' ? '3px solid var(--gold-light)' : '3px solid var(--cyan-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
              {classificationMode === 'photo' ? (
                <>
                  <Upload size={16} color="var(--gold-dark)" />
                  Upload Dance Photo
                </>
              ) : (
                <>
                  <Film size={16} color="var(--cyan-primary)" />
                  Upload Performance Video
                </>
              )}
            </h2>
            {((classificationMode === 'photo' && selectedImage) || (classificationMode === 'video' && selectedVideo)) && (
              <button 
                onClick={classificationMode === 'photo' ? handleClearImage : handleClearVideo}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Photo Mode Upload Dropzone */}
          {classificationMode === 'photo' && (
            <div
              style={{
                border: '2px dashed var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => document.getElementById('style-file-input').click()}
            >
              <input
                type="file"
                id="style-file-input"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageSelect}
              />

              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Dance Preview"
                    style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              ) : (
                <div>
                  <Upload size={36} color="var(--gold-light)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Click to Select Dance Photo</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Supports Bharatanatyam, Kathak, Kathakali, Kuchipudi, Mohiniyattam
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Video Mode Upload Dropzone */}
          {classificationMode === 'video' && (
            <div
              style={{
                border: '2px dashed var(--border-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => document.getElementById('style-video-input').click()}
            >
              <input
                type="file"
                id="style-video-input"
                style={{ display: 'none' }}
                accept="video/*"
                onChange={handleVideoSelect}
              />

              {videoPreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <video
                    src={videoPreviewUrl}
                    controls
                    style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              ) : (
                <div>
                  <Film size={36} color="var(--cyan-primary)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Click to Select Dance Video</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    MP4, WebM, MOV up to 50MB (Multi-Frame Consensus Inference)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {classificationMode === 'photo' ? (
            <button
              onClick={handleAnalyzeImage}
              disabled={!selectedImage || isAnalyzingImage}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
            >
              {isAnalyzingImage ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span>Classifying Dance Style...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  <span>Classify Photo Dance Form</span>
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={handleAnalyzeVideo}
              disabled={!selectedVideo || isAnalyzingVideo}
              className="btn-cyan"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
            >
              {isAnalyzingVideo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span>Processing Video Frames ({videoProgress}%)...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Film size={16} />
                  <span>Classify Video Performance</span>
                </div>
              )}
            </button>
          )}

          {/* Errors */}
          {(imageError || videoError) && (
            <div style={{ padding: '10px 14px', background: 'var(--rose-bg)', color: 'var(--rose-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.86rem' }}>
              {imageError || videoError}
            </div>
          )}

          {/* Reference Styles Overview */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Supported Traditions
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SAMPLE_STYLES.map((s) => (
                <div key={s.name} style={{ background: '#f8fafc', padding: '5px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>
                  {s.name} ({s.origin})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            RESULTS COLUMN (PHOTO OR VIDEO)
            ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeResult ? (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: activeResult.is_classical_dance === false ? '4px solid var(--maroon-primary)' : '4px solid var(--emerald-primary)' }}>
              
              {/* FAULT DETECTOR INTERVENTION CARD */}
              {activeResult.fault_detected && (
                <div style={{
                  padding: '1.4rem',
                  background: '#fff1f2',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecdd3',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '8px', 
                        background: '#ffe4e6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#e11d48'
                      }}>
                        <ShieldAlert size={22} />
                      </div>
                      <div>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 800, 
                          letterSpacing: '0.08em', 
                          textTransform: 'uppercase', 
                          color: '#be123c' 
                        }}>
                          AI Fault Detector Triggered
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#9f1239' }}>
                          {activeResult.fault_title || 'Non-Dance Image Rejected'}
                        </h3>
                      </div>
                    </div>
                    <span style={{ 
                      background: '#e11d48', 
                      color: '#ffffff', 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '4px 10px', 
                      borderRadius: '999px',
                      letterSpacing: '0.04em'
                    }}>
                      {activeResult.fault_code || 'FAULT_TRIGGERED'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#4b5563', lineHeight: 1.5 }}>
                    {activeResult.fault_message || 'The system detected that this image does not depict an Indian classical dance pose.'}
                  </p>

                  {/* Diagnostics Checklist */}
                  {activeResult.diagnostics && (
                    <div style={{
                      background: '#ffffff',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #fecdd3',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        {activeResult.diagnostics.human_detected ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : (
                          <XCircle size={16} color="#ef4444" />
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Human Subject: <strong style={{ color: activeResult.diagnostics.human_detected ? '#059669' : '#dc2626' }}>
                            {activeResult.diagnostics.human_detected ? 'Detected' : 'Not Detected'}
                          </strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        {activeResult.diagnostics.body_complete ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : (
                          <XCircle size={16} color="#ef4444" />
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Posture Visibility: <strong style={{ color: activeResult.diagnostics.body_complete ? '#059669' : '#dc2626' }}>
                            {activeResult.diagnostics.body_complete ? 'Visible Torso' : 'Obscured / Cropped'}
                          </strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        {activeResult.diagnostics.classical_kinematics ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : (
                          <XCircle size={16} color="#ef4444" />
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Dance Kinematics: <strong style={{ color: activeResult.diagnostics.classical_kinematics ? '#059669' : '#dc2626' }}>
                            {activeResult.diagnostics.classical_kinematics ? `${activeResult.diagnostics.kinematics_score}% Match` : '0% (Non-Dance)'}
                          </strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        {activeResult.diagnostics.costume_detected ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : (
                          <XCircle size={16} color="#ef4444" />
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Costume / Attire: <strong style={{ color: activeResult.diagnostics.costume_detected ? '#059669' : '#dc2626' }}>
                            {activeResult.diagnostics.costume_detected ? 'Identified' : 'None Detected'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Guidance Box */}
                  {(activeResult.fault_guidance || activeResult.guidance) && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px', 
                      fontSize: '0.82rem', 
                      color: '#4b5563',
                      background: '#fffbeb',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #fde68a'
                    }}>
                      <Info size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Recommendation: </strong>{activeResult.fault_guidance || activeResult.guidance}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Casual / Normal Stance Notice (if not already handled by fault card) */}
              {!activeResult.fault_detected && activeResult.is_classical_dance === false && (
                <div style={{ padding: '12px 16px', background: 'var(--rose-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Activity size={18} />
                    <span>Casual / Non-Dance Posture Detected</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {activeResult.guidance || 'Arms are resting at sides with straight standing legs. Classical style classification requires a defined dance posture.'}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <span className={`badge ${activeResult.is_classical_dance === false ? 'badge-maroon' : 'badge-emerald'}`} style={{ fontSize: '0.74rem' }}>
                      {activeResult.fault_detected ? 'Fault Detector Flagged' : activeResult.is_classical_dance === false ? 'Non-Classical Posture' : 'Predicted Dance Form'}
                    </span>
                    {activeResult.frames_sampled && (
                      <span className="badge badge-peacock" style={{ fontSize: '0.72rem' }}>
                        {activeResult.frames_sampled} Video Frames Analyzed
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {activeResult.predicted_dance}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
                    <MapPin size={14} color="var(--gold-dark)" />
                    <span>{activeResult.origin || 'India'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700 }}>
                    {activeResult.fault_detected ? 'Dance Match' : activeResult.is_classical_dance === false ? 'Style Match' : 'Confidence'}
                  </span>
                  <span style={{ 
                    fontSize: '1.9rem', 
                    color: activeResult.fault_detected ? '#dc2626' : (activeResult.confidence || 0) >= 80 ? 'var(--emerald-primary)' : (activeResult.confidence || 0) >= 50 ? 'var(--gold-dark)' : 'var(--rose-primary)', 
                    fontWeight: 800 
                  }}>
                    {activeResult.confidence !== undefined ? `${activeResult.confidence}%` : '0%'}
                  </span>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${activeResult.confidence ?? 0}%`, 
                      height: '100%', 
                      background: (activeResult.confidence ?? 0) >= 80 
                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                        : (activeResult.confidence ?? 0) >= 50 
                          ? 'var(--grad-gold)' 
                          : 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease-out'
                    }} 
                  />
                </div>
              </div>

              {/* 5-Classical Tradition Probability Spectrum */}
              {activeResult.class_probabilities && (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'block', marginBottom: '10px' }}>
                    Tradition Probability Spectrum:
                  </span>
                  
                  {activeResult.confidence === 0.0 ? (
                    <div style={{ 
                      padding: '10px 14px', 
                      background: '#ffffff', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px dashed #cbd5e1', 
                      fontSize: '0.82rem', 
                      color: 'var(--text-secondary)', 
                      textAlign: 'center' 
                    }}>
                      AI Probability Spectrum Disabled: No human dancer or classical posture detected to evaluate against classical traditions.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(activeResult.class_probabilities).map(([cname, prob]) => {
                        const isWinning = cname.toLowerCase() === (activeResult.closest_classical_style || activeResult.predicted_dance || '').toLowerCase();
                        return (
                          <div key={cname} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '120px', fontSize: '0.82rem', color: isWinning ? 'var(--gold-dark)' : 'var(--text-secondary)', fontWeight: isWinning ? 800 : 500 }}>
                              {cname}
                            </span>
                            <div style={{ flex: 1, height: '7px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${prob}%`, 
                                  height: '100%', 
                                  background: isWinning 
                                    ? ((activeResult.confidence || 0) < 50 ? 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)' : 'var(--grad-gold)') 
                                    : 'linear-gradient(90deg, #3b82f6 0%, #0ea5e9 100%)',
                                  borderRadius: 'var(--radius-full)'
                                }} 
                              />
                            </div>
                            <span style={{ width: '40px', textAlign: 'right', fontSize: '0.78rem', color: isWinning ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: 700 }}>
                              {prob}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Primary Stance & Costume Notes */}
              {(activeResult.primary_stance || activeResult.costume_style) && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeResult.primary_stance && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--gold-dark)' }}>Stance Geometry: </strong>
                      {activeResult.primary_stance}
                    </div>
                  )}
                  {activeResult.costume_style && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--cyan-primary)' }}>Costume & Attire: </strong>
                      {activeResult.costume_style}
                    </div>
                  )}
                </div>
              )}


            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={40} color="var(--gold-dark)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                {classificationMode === 'photo' ? 'Photo Classifier Ready' : 'Video Classifier Ready'}
              </h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '340px', margin: '0 auto' }}>
                {classificationMode === 'photo' 
                  ? 'Upload a dance photo on the left to classify its classical dance tradition.'
                  : 'Upload a performance video on the left to analyze movement dynamics across frames and predict its classical tradition.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
