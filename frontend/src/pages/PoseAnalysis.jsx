import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Sparkles, 
  Zap, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RotateCw,
  Trophy,
  Save,
  Check,
  Compass,
  Sliders,
  HelpCircle,
  X,
  Layers,
  Download,
  Info
} from 'lucide-react';
import { 
  analyzePoseImage, 
  analyzeDanceVideo, 
  processLiveFrame, 
  saveLiveSession, 
  API_BASE_URL 
} from '../services/api';

const POSES_BY_TRADITION = {
  Bharatanatyam: [
    { id: 'Aramandi (Ayata)', label: 'Aramandi (Ayata)', targetKnee: '120°', targetElbow: '140°', desc: 'Half-sitting diamond stance with knees turned out' },
    { id: 'Natyarambha', label: 'Natyarambha', targetKnee: '130°', targetElbow: '160°', desc: 'Horizontal arm extension at shoulder level' },
    { id: 'Muzhumandi', label: 'Muzhumandi', targetKnee: '60°', targetElbow: '130°', desc: 'Full seated stance on toes with maximum knee turnout' },
    { id: 'Alidha', label: 'Alidha Warrior Stance', targetKnee: '115°', targetElbow: '170°', desc: 'Archer lunge stance with front knee bent and rear leg straight' },
    { id: 'Samapada', label: 'Samapada', targetKnee: '175°', targetElbow: '145°', desc: 'Upright serene stance with vertical axis' }
  ],
  Kathak: [
    { id: 'Samapada', label: 'Samapada Upright', targetKnee: '175°', targetElbow: '140°', desc: 'Upright serene stance with straight spine' },
    { id: 'Tatkar Stance', label: 'Tatkar Stance', targetKnee: '165°', targetElbow: '100°', desc: 'Rhythmic footwork stance with grounded feet' },
    { id: 'Chakkar Dynamic', label: 'Chakkar Dynamic', targetKnee: '160°', targetElbow: '145°', desc: 'Pirouette spin preparation stance' }
  ],
  Kathakali: [
    { id: 'Kalasam Basic', label: 'Kalasam Heroic Stance', targetKnee: '115°', targetElbow: '90°', desc: 'Wide stance on outer foot edges with 90° square chest elbows' },
    { id: 'Paccha Vinyasa', label: 'Paccha Vinyasa', targetKnee: '110°', targetElbow: '95°', desc: 'Expansive noble heroic mudra stance' },
    { id: 'Thoppi', label: 'Thoppi', targetKnee: '105°', targetElbow: '90°', desc: 'Wide stance with outer foot turnout' }
  ],
  Kuchipudi: [
    { id: 'Tribhanga Stance', label: 'Tribhanga (S-Curve)', targetKnee: '130°', targetElbow: '135°', desc: 'Three-bend classic curve at neck, waist, and knee' },
    { id: 'Ayatam', label: 'Ayatam Demisquat', targetKnee: '128°', targetElbow: '150°', desc: 'Lyrical undulating torso posture' },
    { id: 'Manduka Shabdam', label: 'Manduka Shabdam', targetKnee: '90°', targetElbow: '140°', desc: 'Dynamic frog rhythm crouch' },
    { id: 'Tarangam', label: 'Tarangam Posture', targetKnee: '135°', targetElbow: '145°', desc: 'Brass plate balance posture' }
  ],
  Mohiniyattam: [
    { id: 'Andolika Sway', label: 'Andolika (Lasya Sway)', targetKnee: '135°', targetElbow: '135°', desc: 'Lyrical continuous figure-8 torso undulating sway' },
    { id: 'Lasya Mandi', label: 'Lasya Mandi', targetKnee: '145°', targetElbow: '140°', desc: 'Soft knee flexion with circular sway' },
    { id: 'Cholkettu Stance', label: 'Cholkettu Salutation', targetKnee: '140°', targetElbow: '75°', desc: 'Lyrical opening cadence stance' }
  ]
};

export default function PoseAnalysis() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'image' | 'video'

  // LIVE CAMERA STATE
  const [selectedTradition, setSelectedTradition] = useState('Bharatanatyam');
  const [selectedPose, setSelectedPose] = useState('Aramandi (Ayata)');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [holdTimer, setHoldTimer] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const lastSpokenRef = useRef(0);

  // IMAGE POSTURE STATE
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageError, setImageError] = useState('');

  // VIDEO PERFORMANCE STATE
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoDanceForm, setVideoDanceForm] = useState('Bharatanatyam');
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState('');

  // LIVE CAMERA CONTROLS
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Could not access webcam. Please ensure camera permissions are allowed in your browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    setIsCameraActive(false);
    setLiveData(null);
    setHoldTimer(0);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Live frame analysis loop
  useEffect(() => {
    if (!isCameraActive) return;

    let isProcessing = false;

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessing) return;

      const video = videoRef.current;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = video.videoWidth || 640;
      offscreenCanvas.height = video.videoHeight || 480;
      const ctx = offscreenCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

      isProcessing = true;
      offscreenCanvas.toBlob(async (blob) => {
        if (!blob) {
          isProcessing = false;
          return;
        }

        try {
          // Note: pass (blob, targetPose, danceForm) in correct order!
          const res = await processLiveFrame(blob, selectedPose, selectedTradition);
          if (res && (res.success || res.detected !== undefined)) {
            setLiveData(res);

            // Draw skeleton overlay
            const kps = res.keypoints || res.landmarks_list;
            if (kps && canvasRef.current) {
              drawSkeletonOverlay(kps, res.is_optimal);
            }

            // Hold detection for reps
            if (res.detected && res.is_optimal) {
              setHoldTimer(prev => {
                const next = prev + 0.3;
                if (next >= 3.0) {
                  setRepsCompleted(r => r + 1);
                  speakDirective('Perfect pose held! Excellent form.');
                  return 0;
                }
                return next;
              });
            } else {
              setHoldTimer(0);
            }

            // Audio Speech Synthesis Feedback
            if (voiceFeedbackEnabled && res.directives && res.directives.length > 0) {
              const now = Date.now();
              if (now - lastSpokenRef.current > 4000) {
                speakDirective(res.directives[0]);
                lastSpokenRef.current = now;
              }
            }
          }
        } catch (e) {
          // ignore transient frame error
        } finally {
          isProcessing = false;
        }
      }, 'image/jpeg', 0.75);

    }, 280);

    loopRef.current = interval;
    return () => clearInterval(interval);
  }, [isCameraActive, selectedTradition, selectedPose, voiceFeedbackEnabled]);

  const speakDirective = (text) => {
    if (!voiceFeedbackEnabled || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const drawSkeletonOverlay = (keypoints, isOptimal) => {
    if (!canvasRef.current || !keypoints) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Bone Connections
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    ctx.lineWidth = 4;
    ctx.strokeStyle = isOptimal ? '#10b981' : '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.shadowColor = isOptimal ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)';

    // Helper to get coordinates whether keypoints is dictionary or array
    const getPt = (key) => {
      if (!Array.isArray(keypoints)) {
        return keypoints[key];
      }
      // If array of 33 landmarks:
      const idxMap = {
        left_shoulder: 11, right_shoulder: 12,
        left_elbow: 13, right_elbow: 14,
        left_wrist: 15, right_wrist: 16,
        left_hip: 23, right_hip: 24,
        left_knee: 25, right_knee: 26,
        left_ankle: 27, right_ankle: 28
      };
      const idx = idxMap[key];
      return idx !== undefined && keypoints[idx] ? keypoints[idx] : null;
    };

    connections.forEach(([p1Key, p2Key]) => {
      const p1 = getPt(p1Key);
      const p2 = getPt(p2Key);
      if (p1 && p2 && (p1.visibility ?? 1.0) > 0.35 && (p2.visibility ?? 1.0) > 0.35) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Keypoint dots
    const jointsToDraw = ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
    jointsToDraw.forEach(jKey => {
      const p = getPt(jKey);
      if (p && (p.visibility ?? 1.0) > 0.35) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isOptimal ? '#34d399' : '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    });
  };

  const handleSaveLiveSession = async () => {
    if (!liveData) return;
    try {
      await saveLiveSession({
        dance_form: selectedTradition,
        target_pose: selectedPose,
        overall_score: liveData.overall_score ?? 0,
        reps_completed: repsCompleted,
        hold_duration_seconds: Math.round(repsCompleted * 3),
        joint_deviations: liveData.deviations || {},
        directives: liveData.directives || []
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save session error:', err);
    }
  };

  // Image & Video handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageResult(null);
      setImageError('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzingImage(true);
    setImageError('');
    try {
      const data = await analyzePoseImage(selectedImage);
      setImageResult(data);
    } catch (err) {
      setImageError(err.response?.data?.detail || 'An error occurred during pose analysis. Please ensure a clear full body photo is uploaded.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setVideoResult(null);
      setVideoError('');
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) return;
    setIsAnalyzingVideo(true);
    setVideoError('');
    setVideoProgress(0);
    try {
      const data = await analyzeDanceVideo(selectedVideo, videoDanceForm, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setVideoProgress(percent);
      });
      setVideoResult(data);
    } catch (err) {
      setVideoError(err.response?.data?.detail || 'Video processing failed. Ensure format is MP4/WebM with clear dancer illumination.');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (loopRef.current) {
        clearInterval(loopRef.current);
      }
    };
  }, []);

  const currentPoseOptions = POSES_BY_TRADITION[selectedTradition] || POSES_BY_TRADITION.Bharatanatyam;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.35s ease-out' }}>
      
      {/* 1. Header with Mode Switcher */}
      <div className="temple-panel" style={{ padding: '2rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><Sparkles size={12} /> Kinematic Motion Studio</span>
            <span className="badge badge-emerald">33-Keypoint Vision AI</span>
            <span className="badge badge-peacock">Angular Geometry Engine</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Kinematic Posture & Motion Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem', maxWidth: '780px' }}>
            Biomechanical joint degree verification, live webcam skeletal tracking, posture deviation gauges, and temporal performance video kinematics.
          </p>
        </div>

        {/* Tab Switcher & Info Guide */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowInfoModal(true)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem', gap: '6px' }}
            title="Learn how kinematic angular measurements work"
          >
            <Info size={15} /> Kinematics Guide
          </button>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-xs)', flexWrap: 'wrap', gap: '4px' }}>
            <button
              onClick={() => { setActiveTab('live'); }}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'live' ? 700 : 500,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'live' ? 'var(--grad-primary)' : 'transparent',
                color: activeTab === 'live' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Zap size={14} /> Live Camera Studio
            </button>
            
            <button
              onClick={() => { stopCamera(); setActiveTab('image'); }}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'image' ? 700 : 500,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'image' ? 'var(--grad-primary)' : 'transparent',
                color: activeTab === 'image' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Camera size={14} /> Photo Posture
            </button>

            <button
              onClick={() => { stopCamera(); setActiveTab('video'); }}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'video' ? 700 : 500,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'video' ? 'var(--grad-primary)' : 'transparent',
                color: activeTab === 'video' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Video size={14} /> Video Dynamics
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: LIVE CAMERA POSTURE CORRECTION TAB */}
      {activeTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tradition & Target Pose Selector Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700, marginBottom: '4px' }}>
                  Dance Tradition
                </label>
                <select
                  value={selectedTradition}
                  onChange={(e) => {
                    setSelectedTradition(e.target.value);
                    const poses = POSES_BY_TRADITION[e.target.value] || [];
                    if (poses.length > 0) setSelectedPose(poses[0].id);
                  }}
                  className="form-select"
                  style={{ width: '180px', padding: '8px 12px', fontSize: '0.88rem' }}
                >
                  {Object.keys(POSES_BY_TRADITION).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700, marginBottom: '4px' }}>
                  Target Posture Benchmark
                </label>
                <select
                  value={selectedPose}
                  onChange={(e) => setSelectedPose(e.target.value)}
                  className="form-select"
                  style={{ width: '240px', padding: '8px 12px', fontSize: '0.88rem' }}
                >
                  {currentPoseOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.label} (Knee: {p.targetKnee})</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Camera Controls & Voice Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem', gap: '6px' }}
                title="Toggle Real-Time Spoken Directives"
              >
                {voiceFeedbackEnabled ? <Volume2 size={16} color="var(--gold-dark)" /> : <VolumeX size={16} />}
                <span>{voiceFeedbackEnabled ? 'Voice Guidance On' : 'Voice Muted'}</span>
              </button>

              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: '0.92rem' }}
                >
                  <Play size={16} /> Start Live Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '0.92rem', borderColor: 'var(--maroon-primary)', color: 'var(--maroon-primary)' }}
                >
                  <Square size={16} /> Stop Camera
                </button>
              )}
            </div>
          </div>

          {cameraError && (
            <div style={{ padding: '12px 16px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {cameraError}
            </div>
          )}

          {/* Live Studio Workspace Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem' }}>
            
            {/* Live Camera Feed Canvas */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--gold-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--gold-dark)" />
                  Live Skeletal Kinematic View
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {isCameraActive ? (liveData?.detected ? '33 Keypoints Locked' : 'Searching Body') : 'Camera Standby'}
                </span>
              </div>

              {/* Video + Canvas Stack */}
              <div style={{ position: 'relative', width: '100%', minHeight: '380px', maxHeight: '460px', background: '#0f172a', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />
                
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />

                {!isCameraActive && (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Camera size={30} color="var(--gold-light)" />
                    </div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>Webcam Inactive</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '340px', margin: '0 auto 1.25rem' }}>
                      Click "Start Live Camera" to enable instant AI posture correction and skeletal tracking.
                    </p>
                    <button onClick={startCamera} className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
                      Enable Camera
                    </button>
                  </div>
                )}

                {/* Live Hold Timer Overlay */}
                {isCameraActive && holdTimer > 0 && (
                  <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: '#10b981', color: '#ffffff', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.5)' }}>
                    <Sparkles size={15} /> Holding Form: {(3.0 - holdTimer).toFixed(1)}s
                  </div>
                )}
              </div>

              {/* Active Directives Banner */}
              {liveData && liveData.directives && liveData.directives.length > 0 && (
                <div style={{ padding: '10px 14px', background: liveData.is_optimal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-sm)', border: `1px solid ${liveData.is_optimal ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {liveData.is_optimal ? <CheckCircle2 size={18} color="var(--emerald-primary)" /> : <Activity size={18} color="var(--gold-light)" />}
                  <span style={{ color: liveData.is_optimal ? '#34d399' : '#fbbf24', fontSize: '0.88rem', fontWeight: 700 }}>
                    {liveData.directives[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Live Kinematic Telemetry HUD Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                  Live Kinematic Telemetry
                </h3>
                <span className="badge badge-peacock" style={{ fontSize: '0.72rem' }}>
                  Target: {selectedPose}
                </span>
              </div>

              {/* Score & Reps Meter */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* Accuracy Score */}
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'block' }}>
                    Accuracy Score
                  </span>
                  <div style={{ fontSize: '2.4rem', color: (liveData?.overall_score || 0) >= 80 ? 'var(--emerald-primary)' : 'var(--gold-dark)', fontWeight: 800, margin: '2px 0' }}>
                    {liveData && liveData.detected ? `${liveData.overall_score}%` : '--'}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: (liveData?.overall_score || 0) >= 80 ? 'var(--emerald-primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                    {liveData?.is_optimal ? 'Optimal Alignment' : 'Adjusting Posture'}
                  </span>
                </div>

                {/* Repetitions Completed */}
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'block' }}>
                    Reps Completed
                  </span>
                  <div style={{ fontSize: '2.4rem', color: 'var(--gold-dark)', fontWeight: 800, margin: '2px 0' }}>
                    {repsCompleted}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                    3s Form Holds
                  </span>
                </div>

              </div>

              {/* Joint Deviation Gauges */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                    Biomechanical Angular Telemetry
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                    Approx. Values (±3°–5°)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {liveData && liveData.angles ? (
                    Object.entries(liveData.angles).map(([joint, angle]) => {
                      const diff = liveData.deviations?.[joint] || 0;
                      const status = liveData.joint_statuses?.[joint] || 'Optimal';
                      const isGood = status === 'Optimal';

                      return (
                        <div key={joint} style={{ padding: '8px 10px', background: isGood ? 'var(--emerald-bg)' : 'var(--rose-bg)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isGood ? '#a7f3d0' : '#fecaca'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700 }}>
                            <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{joint.replace('_', ' ')}</span>
                            <span style={{ color: isGood ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>~{Math.round(angle)}°</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Dev: ±{diff}° • {status}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: 'span 2', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                      Start camera and step back into frame to see live angular telemetry
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                  * All live joint degrees (knees, shoulders, wrists, elbows) are kinematic approximations (±3°–5°).
                </div>
              </div>

              {/* Save Session Action */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={handleSaveLiveSession}
                  disabled={!liveData || repsCompleted === 0}
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', fontSize: '0.88rem', gap: '6px' }}
                >
                  {savedSuccess ? (
                    <>
                      <Check size={16} /> Saved to Analysis Vault!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Session to Analysis Vault
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 3. TAB 2: IMAGE POSTURE VERIFICATION */}
      {activeTab === 'image' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--gold-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} color="var(--gold-dark)" />
              Upload Classical Posture Photo
            </h3>
            
            <div 
              style={{ 
                border: '2px dashed var(--border-accent)', 
                borderRadius: 'var(--radius-md)', 
                padding: '2rem 1rem', 
                textAlign: 'center', 
                cursor: 'pointer', 
                minHeight: '280px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#f8fafc',
                position: 'relative' 
              }}
              onClick={() => document.getElementById('image-upload-input').click()}
            >
              <input type="file" id="image-upload-input" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
              {imagePreviewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setImagePreviewUrl(null); setImageResult(null); }}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <Camera size={36} color="var(--gold-light)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Click to Select Full Body Image</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    JPG, PNG, WebP up to 15MB
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyzeImage}
              disabled={!selectedImage || isAnalyzingImage}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
            >
              {isAnalyzingImage ? 'Analyzing 33-Keypoint Kinematics...' : 'Analyze Posture Angles'}
            </button>

            {imageError && (
              <div style={{ padding: '10px 14px', background: 'var(--rose-bg)', color: 'var(--rose-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.86rem' }}>
                {imageError}
              </div>
            )}
          </div>

          {/* Image Result Card */}
          {imageResult && (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: imageResult.is_classical_pose === false || (imageResult.overall_pose_score || 0) < 40 ? '4px solid var(--maroon-primary)' : '4px solid var(--emerald-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    Verification Results
                  </h3>
                  {imageResult.stance_type && (
                    <span style={{ fontSize: '0.78rem', color: imageResult.is_classical_pose === false ? '#dc2626' : 'var(--gold-dark)', fontWeight: 700 }}>
                      {imageResult.stance_type}
                    </span>
                  )}
                </div>
                <span className={`badge ${(imageResult.overall_pose_score || 0) >= 80 ? 'badge-emerald' : (imageResult.overall_pose_score || 0) >= 50 ? 'badge-peacock' : 'badge-maroon'}`}>
                  Classical Score: {imageResult.overall_pose_score}%
                </span>
              </div>

              {imageResult.annotated_image_url && (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={`${API_BASE_URL}${imageResult.annotated_image_url}`} 
                    alt="Annotated Pose" 
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: '#0f172a' }} 
                  />
                </div>
              )}

              {/* Angles Breakdown */}
              {imageResult.angles && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                      Kinematic Joint Angles
                    </span>
                    <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                      Approximation Values (±3°–5°)
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {Object.entries(imageResult.angles).map(([j, a]) => (
                      <div key={j} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block' }}>{j.replace('_', ' ')}</span>
                        <span style={{ fontSize: '1.05rem', color: 'var(--gold-dark)', fontWeight: 800 }}>~{Math.round(a)}°</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    * Values shown for knee degrees, shoulder degrees, wrist degrees, and elbow degrees are kinematic approximations.
                  </div>
                </div>
              )}

              {/* Feedback list */}
              {imageResult.feedback && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {imageResult.feedback.map((f, i) => {
                    const isWarning = f.includes('⚠️') || f.includes('Casual') || f.includes('Adjust') || f.includes('Lower') || f.includes('Elevate');
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: isWarning ? '#b45309' : 'var(--text-secondary)' }}>
                        {isWarning ? (
                          <AlertCircle size={16} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <CheckCircle2 size={16} color="var(--emerald-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span>{f}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 4. TAB 3: VIDEO PERFORMANCE KINEMATICS */}
      {activeTab === 'video' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Video Upload & Settings */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="var(--cyan-primary)" />
                Upload Performance Video
              </h3>
              {selectedVideo && (
                <button
                  onClick={() => { setSelectedVideo(null); setVideoPreviewUrl(null); setVideoResult(null); setVideoError(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                Target Benchmark Tradition
              </label>
              <select
                value={videoDanceForm}
                onChange={(e) => setVideoDanceForm(e.target.value)}
                className="form-select"
                style={{ padding: '9px 12px' }}
              >
                <option value="auto">✨ Auto-Detect with AI</option>
                {Object.keys(POSES_BY_TRADITION).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div 
              style={{ 
                border: '2px dashed var(--border-cyan)', 
                borderRadius: 'var(--radius-md)', 
                padding: '2rem 1rem', 
                textAlign: 'center', 
                cursor: 'pointer', 
                minHeight: '240px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#f8fafc',
                position: 'relative'
              }}
              onClick={() => document.getElementById('video-upload-input').click()}
            >
              <input type="file" id="video-upload-input" style={{ display: 'none' }} accept="video/*" onChange={handleVideoChange} />
              {videoPreviewUrl ? (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <video src={videoPreviewUrl} controls style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: 'var(--radius-sm)' }} />
                </div>
              ) : (
                <div>
                  <Video size={38} color="var(--cyan-primary)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.96rem', margin: 0 }}>Select Dance Performance Clip</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    MP4, WebM, MOV up to 50MB (Multi-Frame Kinematics + AI Style Prediction)
                  </span>
                </div>
              )}
            </div>

            {isAnalyzingVideo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>Processing Video Dynamics & Skeletons...</span>
                  <span style={{ fontWeight: 700, color: 'var(--cyan-primary)' }}>{videoProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${videoProgress}%`, height: '100%', background: 'var(--grad-cyan)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyzeVideo}
              disabled={!selectedVideo || isAnalyzingVideo}
              className="btn-cyan"
              style={{ width: '100%', padding: '12px', fontSize: '0.96rem' }}
            >
              {isAnalyzingVideo ? 'Computing Kinematics & Style...' : 'Analyze Video Performance'}
            </button>

            {videoError && (
              <div style={{ padding: '10px 14px', background: 'var(--rose-bg)', color: 'var(--rose-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.86rem' }}>
                {videoError}
              </div>
            )}
          </div>

          {/* Video Result Presentation */}
          {videoResult ? (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--gold-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
              
              {/* Header: Predicted Style & Motion Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">
                      <Sparkles size={12} /> Predicted: {videoResult.predicted_dance_form || videoResult.effective_dance_form}
                    </span>
                    <span className="badge badge-peacock">
                      {videoResult.style_confidence ? `${videoResult.style_confidence}% Style Match` : 'Deep Vision AI'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                    {videoResult.effective_dance_form || videoResult.selected_dance_form} Performance
                  </h3>
                  {videoResult.canonical_pose && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      Benchmark Standard: {videoResult.canonical_pose}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', fontWeight: 700 }}>
                    Motion Score
                  </span>
                  <span style={{ fontSize: '1.9rem', color: (videoResult.overall_performance_score ?? videoResult.overall_score ?? 0) >= 75 ? 'var(--emerald-primary)' : (videoResult.overall_performance_score ?? videoResult.overall_score ?? 0) >= 50 ? 'var(--gold-dark)' : 'var(--rose-primary)', fontWeight: 800 }}>
                    {videoResult.overall_performance_score ?? videoResult.overall_score ?? 0}%
                  </span>
                </div>
              </div>

              {/* Annotated Video Playback */}
              {videoResult.annotated_video_url && (
                <div style={{ background: '#000000', borderRadius: 'var(--radius-md)', padding: '0.75rem', overflow: 'hidden', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--cyan-light)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Annotated 33-Keypoint Skeletal Stream
                  </span>
                  <video 
                    src={`${API_BASE_URL}${videoResult.annotated_video_url}`} 
                    controls 
                    style={{ width: '100%', maxHeight: '280px', borderRadius: 'var(--radius-sm)' }} 
                  />
                </div>
              )}

              {/* 4-Metric Kinematic Telemetry Grid */}
              {videoResult.scores && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Pose Accuracy</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--emerald-primary)', fontWeight: 800 }}>{videoResult.scores.pose_accuracy}%</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Fluidity</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--cyan-primary)', fontWeight: 800 }}>{videoResult.scores.movement_similarity}%</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Rhythm & Laya</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--gold-dark)', fontWeight: 800 }}>
                      {videoResult.scores.rhythm_tempo}%
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>~{videoResult.scores.estimated_bpm || 72} BPM</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Spinal Balance</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--purple-primary)', fontWeight: 800 }}>{videoResult.scores.body_alignment}%</span>
                  </div>

                </div>
              )}

              {/* Video Statistics Chips */}
              {videoResult.statistics && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <strong>Frames:</strong> {videoResult.statistics.total_frames} total ({videoResult.statistics.pose_detected_frames} tracked)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    • <strong>Detection Rate:</strong> {videoResult.statistics.detection_rate}%
                  </span>
                  {videoResult.statistics.duration_seconds && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      • <strong>Duration:</strong> {videoResult.statistics.duration_seconds}s
                    </span>
                  )}
                </div>
              )}

              {/* Feedback List */}
              {videoResult.feedback && videoResult.feedback.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                    Natyashastra Directives:
                  </span>
                  {videoResult.feedback.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <CheckCircle2 size={15} color="var(--emerald-primary)" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
              <Video size={40} color="var(--cyan-primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                Video Performance Studio Ready
              </h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '340px', margin: '0 auto' }}>
                Upload a performance video on the left to generate kinematic posture telemetry, rhythm consistency, and annotated skeletal tracking.
              </p>
            </div>
          )}

        </div>
      )}

      {/* 5. Kinematics Guide Modal */}
      {showInfoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '620px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={20} color="var(--cyan-primary)" />
                Kinematic Studio Measurement System
              </h3>
              <button onClick={() => setShowInfoModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. Joint Angular Geometry:</strong> The studio extracts 33 biomechanical keypoints from video or photos. Each key joint (knee flex, elbow curve, shoulder abduction, hip elevation) is measured in precise geometric degrees.
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. Natyashastra Benchmark Comparison:</strong> Measurements are compared in real-time against classical Natyashastra canonical benchmarks (e.g. Aramandi knee angle ideal 120° ± 15°).
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. Color-Coded Tolerance Statuses:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                  <div style={{ background: 'var(--emerald-bg)', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '4px', textAlign: 'center', color: 'var(--emerald-primary)', fontWeight: 700, fontSize: '0.78rem' }}>
                    Optimal (±10°)
                  </div>
                  <div style={{ background: 'var(--gold-bg)', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '4px', textAlign: 'center', color: 'var(--gold-dark)', fontWeight: 700, fontSize: '0.78rem' }}>
                    Adjust (±20°)
                  </div>
                  <div style={{ background: 'var(--rose-bg)', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '4px', textAlign: 'center', color: 'var(--rose-primary)', fontWeight: 700, fontSize: '0.78rem' }}>
                    Correction (&gt;20°)
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>4. Repetition Hold Mechanics:</strong> When maintaining an optimal classical posture (score &ge; 80%), the 3-second hold countdown triggers. Maintaining the form successfully scores a classical rehearsal rep!
              </div>
            </div>

            <button onClick={() => setShowInfoModal(false)} className="btn-cyan" style={{ padding: '10px', marginTop: '0.5rem', width: '100%' }}>
              Understand & Proceed
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
