import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Video, 
  Play, 
  Square, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Maximize2, 
  Minimize2, 
  Download, 
  Music, 
  Layers, 
  Eye, 
  EyeOff,
  Clock, 
  Flame, 
  Sliders, 
  Compass, 
  Award,
  ChevronRight,
  Save,
  Check,
  HelpCircle,
  X,
  Zap,
  Info
} from 'lucide-react';
import { processLiveFrame, saveLiveSession, API_BASE_URL } from '../services/api';

const REHEARSAL_POSES = {
  Bharatanatyam: [
    { 
      id: 'Aramandi (Ayata)', 
      label: 'Aramandi (Ayata)', 
      targetKnee: 120, 
      targetElbow: 140, 
      desc: 'Diamond half-squat with 180° outward knee turnout and lateral curved arms', 
      mudra: 'Pataka & Tripataka',
      silhouetteType: 'aramandi'
    },
    { 
      id: 'Natyarambha', 
      label: 'Natyarambha Frame', 
      targetKnee: 130, 
      targetElbow: 160, 
      desc: 'Horizontal shoulder-level arm frame with soft curve', 
      mudra: 'Pataka',
      silhouetteType: 'natyarambha'
    },
    { 
      id: 'Muzhumandi', 
      label: 'Muzhumandi (Full Sit)', 
      targetKnee: 60, 
      targetElbow: 130, 
      desc: 'Full deep squat on balls of feet with knees flared out laterally', 
      mudra: 'Katakamuha',
      silhouetteType: 'muzhumandi'
    },
    { 
      id: 'Alidha', 
      label: 'Alidha Warrior Stance', 
      targetKnee: 115, 
      targetElbow: 170, 
      desc: 'Heroic warrior archer lunge stance with front knee bent and rear leg straight', 
      mudra: 'Shikhara & Dhanur',
      silhouetteType: 'alidha'
    },
    {
      id: 'Samapada',
      label: 'Samapada (Upright)',
      targetKnee: 175,
      targetElbow: 145,
      desc: 'Upright serene stance with feet together and vertical spinal axis',
      mudra: 'Pataka',
      silhouetteType: 'samapada'
    }
  ],
  Kuchipudi: [
    { 
      id: 'Tribhanga Stance', 
      label: 'Tribhanga (S-Curve)', 
      targetKnee: 130, 
      targetElbow: 135, 
      desc: 'Signature three-bend curve at neck, torso, and knee', 
      mudra: 'Alapadma',
      silhouetteType: 'tribhanga'
    },
    { 
      id: 'Ayatam', 
      label: 'Ayatam Demisquat', 
      targetKnee: 128, 
      targetElbow: 150, 
      desc: 'Lyrical torso undulation with grounding half-seat', 
      mudra: 'Hamsasya',
      silhouetteType: 'aramandi'
    },
    { 
      id: 'Manduka Shabdam', 
      label: 'Manduka Shabdam', 
      targetKnee: 90, 
      targetElbow: 140, 
      desc: 'Dynamic spring-loaded frog narrative crouch', 
      mudra: 'Kartarimukha',
      silhouetteType: 'muzhumandi'
    },
    {
      id: 'Tarangam',
      label: 'Tarangam Balance',
      targetKnee: 135,
      targetElbow: 145,
      desc: 'Brass plate balance poise requiring central core stability',
      mudra: 'Pataka',
      silhouetteType: 'aramandi'
    }
  ],
  Kathak: [
    { 
      id: 'Samapada', 
      label: 'Samapada Upright', 
      targetKnee: 175, 
      targetElbow: 140, 
      desc: 'Erect vertical axis with gentle chest expansion and poised arms', 
      mudra: 'Pataka',
      silhouetteType: 'samapada'
    },
    { 
      id: 'Tatkar Stance', 
      label: 'Tatkar Base Stance', 
      targetKnee: 165, 
      targetElbow: 100, 
      desc: 'Grounded footwork stance with hands at solar plexus', 
      mudra: 'Mushti',
      silhouetteType: 'tatkar'
    },
    { 
      id: 'Chakkar Dynamic', 
      label: 'Chakkar Spin Prep', 
      targetKnee: 160, 
      targetElbow: 145, 
      desc: 'Spiral coiled stance for lightning pirouette turns', 
      mudra: 'Spiral',
      silhouetteType: 'chakkar'
    }
  ],
  Kathakali: [
    { 
      id: 'Kalasam Basic', 
      label: 'Kalasam Heroic Stance', 
      targetKnee: 115, 
      targetElbow: 90, 
      desc: 'Wide martial stance on outer foot edges with 90° square chest elbows', 
      mudra: 'Mudrakhya',
      silhouetteType: 'kalasam'
    },
    { 
      id: 'Paccha Vinyasa', 
      label: 'Paccha Vinyasa', 
      targetKnee: 110, 
      targetElbow: 95, 
      desc: 'Noble heroic avatar posture with elevated chest', 
      mudra: 'Pataka',
      silhouetteType: 'kalasam'
    },
    {
      id: 'Thoppi',
      label: 'Thoppi Wide Stance',
      targetKnee: 105,
      targetElbow: 90,
      desc: 'Expansive grounded stance with maximum pelvis sink',
      mudra: 'Mudrakhya',
      silhouetteType: 'kalasam'
    }
  ],
  Mohiniyattam: [
    { 
      id: 'Andolika Sway', 
      label: 'Andolika (Lasya Sway)', 
      targetKnee: 135, 
      targetElbow: 135, 
      desc: 'Lyrical continuous figure-8 torso undulating sway', 
      mudra: 'Hamsasya',
      silhouetteType: 'andolika'
    },
    { 
      id: 'Lasya Mandi', 
      label: 'Lasya Mandi', 
      targetKnee: 145, 
      targetElbow: 140, 
      desc: 'Soft rounded knee flex with gentle circular pelvic sway', 
      mudra: 'Mukula',
      silhouetteType: 'aramandi'
    },
    { 
      id: 'Cholkettu Stance', 
      label: 'Cholkettu Salutation', 
      targetKnee: 140, 
      targetElbow: 75, 
      desc: 'Devotional Anjali Mudra bow held reverently at heart center', 
      mudra: 'Anjali',
      silhouetteType: 'cholkettu'
    }
  ]
};

const TALAS_CONFIG = {
  adi: { name: 'Adi Tala (Carnatic)', beats: 8, pattern: '1 2 3 4 | 5 6 | 7 8', syllables: ['Tha', 'Dhi', 'Thom', 'Nam', 'Tha', 'Dhi', 'Thom', 'Nam'] },
  rupaka: { name: 'Rupaka Tala (Carnatic)', beats: 6, pattern: '1 2 | 3 4 5 6', syllables: ['Dhrut', 'Dhrut', 'Tha', 'Ki', 'Ta', 'Thom'] },
  misrachapu: { name: 'Misra Chapu (Carnatic)', beats: 7, pattern: '1 2 3 | 4 5 | 6 7', syllables: ['Tha', 'Ki', 'Ta', 'Tha', 'Ka', 'Dhi', 'Mi'] },
  teental: { name: 'Teental (Kathak / Hindustani)', beats: 16, pattern: '4 + 4 + 4 + 4', syllables: ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha'] }
};

export default function LiveRehearsal() {
  // Navigation & Form Selection
  const [selectedTradition, setSelectedTradition] = useState('Bharatanatyam');
  const [selectedPoseId, setSelectedPoseId] = useState('Aramandi (Ayata)');
  
  // Camera & Visual Overlays
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showGhostOverlay, setShowGhostOverlay] = useState(true);
  const [showAngleBadges, setShowAngleBadges] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Live Biomechanical Telemetry State
  const [liveMetrics, setLiveMetrics] = useState({
    detected: false,
    overallScore: 0,
    leftKneeAngle: 0,
    rightKneeAngle: 0,
    leftShoulderAngle: 0,
    rightShoulderAngle: 0,
    leftWristAngle: 0,
    rightWristAngle: 0,
    leftElbowAngle: 0,
    rightElbowAngle: 0,
    shoulderBalance: 'Optimal Level',
    aramandiDepth: 'Calibrating...',
    spineAlignment: '98% Centered',
    balanceScore: 85,
    deviations: {},
    jointStatuses: {},
    feedback: []
  });

  // Rehearsal Session Tracker
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [holdTimer, setHoldTimer] = useState(0);
  const [targetHoldDuration, setTargetHoldDuration] = useState(3.0); // 3 seconds hold per rep
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [saveVaultSuccess, setSaveVaultSuccess] = useState(false);
  const [isSavingVault, setIsSavingVault] = useState(false);

  // Tala Metronome
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [selectedTalaKey, setSelectedTalaKey] = useState('adi');
  const [bpm, setBpm] = useState(72);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  // DOM & State Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const containerRef = useRef(null);
  const lastVoiceTimeRef = useRef(0);
  const audioContextRef = useRef(null);
  const metronomeTimerRef = useRef(null);
  const latestLandmarksRef = useRef(null);

  const currentPoseObj = (REHEARSAL_POSES[selectedTradition] || []).find(p => p.id === selectedPoseId) || REHEARSAL_POSES.Bharatanatyam[0];

  // Initialize Metronome Audio
  const playClickSound = (isFirstBeat = false) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isFirstBeat ? 880 : 520, ctx.currentTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (err) {
      console.warn('Audio click note:', err);
    }
  };

  // Tala Metronome Loop
  useEffect(() => {
    if (!isMetronomePlaying) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    const currentTala = TALAS_CONFIG[selectedTalaKey];

    metronomeTimerRef.current = setInterval(() => {
      setCurrentBeatIndex(prev => {
        const next = (prev + 1) % currentTala.beats;
        playClickSound(next === 0);
        return next;
      });
    }, intervalMs);

    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isMetronomePlaying, bpm, selectedTalaKey]);

  // Session Duration Timer
  useEffect(() => {
    let sessionTimer;
    if (isCameraActive) {
      sessionTimer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(sessionTimer);
  }, [isCameraActive]);

  // Speech Synthesizer for Real-time Voice Coach
  const speakDirective = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;
    const now = Date.now();
    if (now - lastVoiceTimeRef.current < 4500) return; // Throttle speech to avoid overlapping
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
    lastVoiceTimeRef.current = now;
  };

  // Start Webcam Stream
  const startLiveCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setSessionStartTime(new Date());
    } catch (err) {
      console.error('Webcam start error:', err);
      setCameraError('Unable to access webcam. Please verify camera permissions in your browser.');
    }
  };

  // Stop Webcam Stream
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    setHoldTimer(0);
    latestLandmarksRef.current = null;
    setLiveMetrics(prev => ({ ...prev, detected: false, overallScore: 0 }));
  };

  // Continuous Camera Evaluation & Canvas Rendering Loop
  useEffect(() => {
    if (!isCameraActive) return;

    let isProcessing = false;
    let lastEvalTime = 0;

    const processFrame = async () => {
      if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // 1. Draw mirrored camera feed
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // 2. Draw Ghost Target Skeleton Silhouette if toggled
        if (showGhostOverlay) {
          drawGhostSilhouette(ctx, canvas.width, canvas.height, currentPoseObj);
        }

        // 3. Draw Real-Time Detected User Skeleton if available & toggled
        if (showSkeleton && latestLandmarksRef.current) {
          drawUserSkeleton(ctx, canvas.width, canvas.height, latestLandmarksRef.current, liveMetrics.overallScore >= 80);
        }

        // 4. Send frame to backend AI every 260ms for ultra-fast joint analysis
        const now = Date.now();
        if (now - lastEvalTime > 260 && !isProcessing) {
          isProcessing = true;
          lastEvalTime = now;

          // Create temporary offscreen canvas for frame capture (unmirrored for standard coordinate mapping)
          const offscreen = document.createElement('canvas');
          offscreen.width = canvas.width;
          offscreen.height = canvas.height;
          const offCtx = offscreen.getContext('2d');
          offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);

          offscreen.toBlob(async (blob) => {
            if (blob) {
              try {
                const data = await processLiveFrame(blob, currentPoseObj.id, selectedTradition);
                if (data && (data.success || data.detected !== undefined)) {
                  const angles = data.angles || {};
                  const align = data.alignment || {};
                  const score = data.overall_score || data.score || (data.detected ? 80 : 0);
                  const isDetected = !!data.detected;

                  if (data.keypoints) {
                    latestLandmarksRef.current = data.keypoints;
                  } else if (data.landmarks_list) {
                    latestLandmarksRef.current = data.landmarks_list;
                  }

                  setLiveMetrics({
                    detected: isDetected,
                    overallScore: isDetected ? Math.round(score) : 0,
                    leftKneeAngle: Math.round(angles.left_knee || 0),
                    rightKneeAngle: Math.round(angles.right_knee || 0),
                    leftShoulderAngle: Math.round(angles.left_shoulder || 0),
                    rightShoulderAngle: Math.round(angles.right_shoulder || 0),
                    leftWristAngle: Math.round(angles.left_wrist || 170),
                    rightWristAngle: Math.round(angles.right_wrist || 170),
                    leftElbowAngle: Math.round(angles.left_elbow || 0),
                    rightElbowAngle: Math.round(angles.right_elbow || 0),
                    shoulderBalance: align.shoulder || (isDetected ? 'Symmetrical' : 'Standby'),
                    aramandiDepth: align.aramandi_depth || (score >= 80 ? 'Optimal Depth' : 'Adjust Stance'),
                    spineAlignment: align.spine || '98% Centered',
                    balanceScore: Math.round(align.balance_score || 85),
                    deviations: data.deviations || {},
                    jointStatuses: data.joint_statuses || {},
                    feedback: data.directives || data.feedback || []
                  });

                  // Hold timer & reps tracking
                  if (isDetected && score >= 78) {
                    setHoldTimer(prev => {
                      const next = prev + 0.28;
                      if (next >= targetHoldDuration) {
                        setRepsCompleted(r => r + 1);
                        speakDirective("Repetition complete! Classical alignment achieved.");
                        return 0;
                      }
                      return next;
                    });
                  } else {
                    setHoldTimer(prev => Math.max(0, prev - 0.2));
                  }

                  // Voice Coach Directives
                  if (data.directives && data.directives.length > 0) {
                    speakDirective(data.directives[0]);
                  }
                }
              } catch (evalErr) {
                // Silently fallback without disrupting live render
              } finally {
                isProcessing = false;
              }
            } else {
              isProcessing = false;
            }
          }, 'image/jpeg', 0.80);
        }
      }

      loopRef.current = requestAnimationFrame(processFrame);
    };

    loopRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [isCameraActive, currentPoseObj, showGhostOverlay, showSkeleton, showAngleBadges, selectedTradition, targetHoldDuration]);

  // Draw Real-Time Detected User Skeleton on Mirrored Canvas
  const drawUserSkeleton = (ctx, w, h, keypoints, isOptimal) => {
    if (!keypoints) return;

    ctx.save();
    // Since video is drawn mirrored (scaleX(-1)), we mirror coordinates or draw in un-mirrored space
    // Let's draw in canvas coordinate space where X is mirrored to match the flipped display
    const mirrorX = (rawX) => (1.0 - rawX) * w;
    const toY = (rawY) => rawY * h;

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

    // Bone Glow
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = isOptimal ? '#10b981' : '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.shadowColor = isOptimal ? 'rgba(16, 185, 129, 0.8)' : 'rgba(245, 158, 11, 0.8)';

    connections.forEach(([p1Key, p2Key]) => {
      const p1 = keypoints[p1Key];
      const p2 = keypoints[p2Key];
      if (p1 && p2 && p1.visibility > 0.35 && p2.visibility > 0.35) {
        ctx.beginPath();
        ctx.moveTo(mirrorX(p1.x), toY(p1.y));
        ctx.lineTo(mirrorX(p2.x), toY(p2.y));
        ctx.stroke();
      }
    });

    // Joint Nodes
    Object.entries(keypoints).forEach(([jointName, p]) => {
      if (p && p.visibility > 0.35) {
        const cx = mirrorX(p.x);
        const cy = toY(p.y);

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = isOptimal ? '#34d399' : '#fbbf24';
        ctx.fill();

        // Inner Core Dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Optional Live Angle Badges
        if (showAngleBadges && (jointName.includes('knee') || jointName.includes('elbow') || jointName.includes('shoulder') || jointName.includes('wrist'))) {
          const angleVal = jointName === 'left_knee' ? liveMetrics.leftKneeAngle :
                           jointName === 'right_knee' ? liveMetrics.rightKneeAngle :
                           jointName === 'left_shoulder' ? liveMetrics.leftShoulderAngle :
                           jointName === 'right_shoulder' ? liveMetrics.rightShoulderAngle :
                           jointName === 'left_wrist' ? liveMetrics.leftWristAngle :
                           jointName === 'right_wrist' ? liveMetrics.rightWristAngle :
                           jointName === 'left_elbow' ? liveMetrics.leftElbowAngle :
                           liveMetrics.rightElbowAngle;

          if (angleVal > 0) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = isOptimal ? '#10b981' : '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(cx + 8, cy - 10, 48, 18, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(`~${angleVal}°`, cx + 12, cy + 3);
          }
        }
      }
    });

    ctx.restore();
  };

  // Draw Adaptive Ghost Target Skeleton Silhouette (Onion Skin)
  const drawGhostSilhouette = (ctx, w, h, pose) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([6, 6]);

    const cx = w / 2;
    const cy = h / 2 - 15;
    const type = pose.silhouetteType || 'aramandi';

    if (type === 'samapada') {
      // Upright Vertical Axis Stance
      ctx.beginPath();
      ctx.arc(cx, cy - 150, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 126);
      ctx.lineTo(cx, cy + 30);
      ctx.stroke();

      // Horizontal Shoulders
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 90);
      ctx.lineTo(cx + 80, cy - 90);
      ctx.stroke();

      // Arms curved down gracefully
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 90);
      ctx.lineTo(cx - 130, cy - 20);
      ctx.lineTo(cx - 90, cy + 40);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 80, cy - 90);
      ctx.lineTo(cx + 130, cy - 20);
      ctx.lineTo(cx + 90, cy + 40);
      ctx.stroke();

      // Straight Legs together
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 30);
      ctx.lineTo(cx - 30, cy + 190);
      ctx.moveTo(cx + 30, cy + 30);
      ctx.lineTo(cx + 30, cy + 190);
      ctx.stroke();

    } else if (type === 'tribhanga') {
      // Kuchipudi / Odissi S-Curve Posture
      ctx.beginPath();
      ctx.arc(cx + 20, cy - 150, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Curved Spine
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 126);
      ctx.quadraticCurveTo(cx - 35, cy - 40, cx + 45, cy + 30);
      ctx.stroke();

      // Shoulders tilted
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 100);
      ctx.lineTo(cx + 90, cy - 80);
      ctx.stroke();

      // Left arm high, right arm low
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 100);
      ctx.lineTo(cx - 140, cy - 110);
      ctx.lineTo(cx - 170, cy - 70);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 90, cy - 80);
      ctx.lineTo(cx + 150, cy - 30);
      ctx.lineTo(cx + 120, cy + 30);
      ctx.stroke();

      // Flexed bent legs
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy + 30);
      ctx.lineTo(cx - 60, cy + 110);
      ctx.lineTo(cx - 20, cy + 190);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 50, cy + 30);
      ctx.lineTo(cx + 110, cy + 110);
      ctx.lineTo(cx + 50, cy + 190);
      ctx.stroke();

    } else if (type === 'muzhumandi') {
      // Full Deep Sit / Crouch Stance
      ctx.beginPath();
      ctx.arc(cx, cy - 60, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 38);
      ctx.lineTo(cx, cy + 70);
      ctx.stroke();

      // Arms at chest level
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 15);
      ctx.lineTo(cx + 70, cy - 15);
      ctx.lineTo(cx + 130, cy + 20);
      ctx.lineTo(cx + 90, cy + 70);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 15);
      ctx.lineTo(cx - 130, cy + 20);
      ctx.lineTo(cx - 90, cy + 70);
      ctx.stroke();

      // Deep squat flared knees
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 70);
      ctx.lineTo(cx - 150, cy + 120);
      ctx.lineTo(cx - 20, cy + 190);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 70);
      ctx.lineTo(cx + 150, cy + 120);
      ctx.lineTo(cx + 20, cy + 190);
      ctx.stroke();

    } else if (type === 'kalasam') {
      // Kathakali Martial Square Stance
      ctx.beginPath();
      ctx.arc(cx, cy - 130, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 106);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // 90° Square Chest Arms
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 70);
      ctx.lineTo(cx + 85, cy - 70);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 70);
      ctx.lineTo(cx - 170, cy - 70);
      ctx.lineTo(cx - 170, cy - 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 85, cy - 70);
      ctx.lineTo(cx + 170, cy - 70);
      ctx.lineTo(cx + 170, cy - 10);
      ctx.stroke();

      // Wide stance knees
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 20);
      ctx.lineTo(cx - 140, cy + 100);
      ctx.lineTo(cx - 90, cy + 190);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 40, cy + 20);
      ctx.lineTo(cx + 140, cy + 100);
      ctx.lineTo(cx + 90, cy + 190);
      ctx.stroke();

    } else {
      // Default: Classical Aramandi / Natyarambha Diamond Stance
      ctx.beginPath();
      ctx.arc(cx, cy - 140, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 116);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // Horizontal Shoulders & Arms
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 80);
      ctx.lineTo(cx + 85, cy - 80);
      ctx.stroke();

      // Left Arm Arc
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 80);
      ctx.lineTo(cx - 165, cy - 70);
      ctx.lineTo(cx - 215, cy - 50);
      ctx.stroke();

      // Right Arm Arc
      ctx.beginPath();
      ctx.moveTo(cx + 85, cy - 80);
      ctx.lineTo(cx + 165, cy - 70);
      ctx.lineTo(cx + 215, cy - 50);
      ctx.stroke();

      // Pelvis & Legs (Aramandi Diamond)
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 20);
      ctx.lineTo(cx - 135, cy + 95);
      ctx.lineTo(cx - 60, cy + 195);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 40, cy + 20);
      ctx.lineTo(cx + 135, cy + 95);
      ctx.lineTo(cx + 60, cy + 195);
      ctx.stroke();
    }

    // Floor Reference Guide
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy + 195);
    ctx.lineTo(cx + 160, cy + 195);
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.stroke();

    ctx.restore();
  };

  // Capture Rehearsal Snapshot
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `natya_live_rehearsal_${selectedPoseId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    a.click();
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 3500);
  };

  // Toggle Video Take Recording
  const handleToggleRecord = () => {
    if (!isCameraActive || !streamRef.current) return;

    if (!isRecording) {
      try {
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `natya_rehearsal_take_${selectedPoseId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Recorder error:', err);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  // Save Session to Analysis Vault
  const handleSaveToVault = async () => {
    setIsSavingVault(true);
    try {
      await saveLiveSession({
        dance_form: selectedTradition,
        target_pose: currentPoseObj.id,
        overall_score: liveMetrics.overallScore || 85.0,
        reps_completed: repsCompleted,
        hold_duration_seconds: Math.round(repsCompleted * targetHoldDuration + elapsedSeconds),
        joint_deviations: liveMetrics.deviations || {},
        directives: liveMetrics.feedback || []
      });
      setSaveVaultSuccess(true);
      setTimeout(() => setSaveVaultSuccess(false), 3500);
    } catch (err) {
      console.error('Save vault error:', err);
    } finally {
      setIsSavingVault(false);
    }
  };

  // Fullscreen Theater Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentTalaObj = TALAS_CONFIG[selectedTalaKey];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.35s ease-out' }}>
      
      {/* 1. Header Banner */}
      <div className="temple-panel" style={{ padding: '2rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><Camera size={13} /> Live Mirror Rehearsal Studio</span>
            <span className="badge badge-peacock"><Activity size={13} /> 30 FPS Shastra HUD</span>
            <span className="badge badge-maroon"><Music size={13} /> Tala Rhythmic Sync</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Live Classical Dance Rehearsal Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem', maxWidth: '780px' }}>
            Practice before the AI Shastra Mirror with real-time 33-keypoint skeletal tracking, dynamic target ghost silhouettes, joint deviation gauges, Tala metronome, and voice coaching.
          </p>
        </div>

        {/* Primary Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowGuideModal(true)} 
            className="btn-secondary" 
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="How Rehearsal Works Guide"
          >
            <HelpCircle size={17} /> How it Works
          </button>

          {!isCameraActive ? (
            <button onClick={startLiveCamera} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <Play size={18} /> Launch Live Mirror
            </button>
          ) : (
            <button onClick={stopLiveCamera} className="btn-danger" style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: '8px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
              <Square size={16} /> Stop Rehearsal
            </button>
          )}

          <button onClick={toggleFullscreen} className="btn-secondary" style={{ padding: '12px 16px' }} title="Toggle Fullscreen Theater View">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {cameraError && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.35)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <AlertCircle size={20} /> {cameraError}
        </div>
      )}

      {/* 2. Main Studio Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isFullscreen ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 540px), 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Live Video Canvas & HUD Mirror */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--gold-primary)' }}>
          
          {/* Top Camera Status & Overlay Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isCameraActive ? '#10b981' : '#64748b', boxShadow: isCameraActive ? '0 0 10px #10b981' : 'none' }}></div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isCameraActive ? (liveMetrics.detected ? 'TRACKING ACTIVE' : 'AWAITING DANCER') : 'CAMERA STANDBY'}
              </span>
              {isCameraActive && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', background: '#f1f5f9', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Viewport Overlay Toggles */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowSkeleton(!showSkeleton)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: showSkeleton ? '1px solid var(--emerald-primary)' : '1px solid var(--border-subtle)',
                  background: showSkeleton ? 'var(--emerald-bg)' : '#f8fafc',
                  color: showSkeleton ? 'var(--emerald-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Toggle Real-Time Skeleton Overlay"
              >
                {showSkeleton ? <Eye size={13} /> : <EyeOff size={13} />} Skeleton
              </button>

              <button 
                onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: showGhostOverlay ? '1px solid var(--gold-light)' : '1px solid var(--border-subtle)',
                  background: showGhostOverlay ? 'var(--gold-bg)' : '#f8fafc',
                  color: showGhostOverlay ? 'var(--gold-dark)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Toggle Benchmark Ghost Silhouette Guide"
              >
                <Layers size={13} /> Ghost Guide
              </button>

              <button 
                onClick={() => setShowAngleBadges(!showAngleBadges)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: showAngleBadges ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                  background: showAngleBadges ? 'var(--cyan-bg)' : '#f8fafc',
                  color: showAngleBadges ? 'var(--cyan-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Toggle Real-Time Joint Angle Labels"
              >
                <Compass size={13} /> Angles
              </button>

              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: voiceEnabled ? '1px solid var(--gold-light)' : '1px solid var(--border-subtle)',
                  background: voiceEnabled ? 'var(--gold-bg)' : '#f8fafc',
                  color: voiceEnabled ? 'var(--gold-dark)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Toggle Real-Time Audio Voice Directives"
              >
                {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />} Voice
              </button>
            </div>
          </div>

          {/* Mirror Viewport Canvas Container */}
          <div style={{ position: 'relative', width: '100%', minHeight: '440px', background: '#0e1726', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Hidden raw video element */}
            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

            {/* Output Mirrored Canvas */}
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }} />

            {/* Inactive Standby Screen */}
            {!isCameraActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem', textAlign: 'center', gap: '1rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--gold-primary)', color: 'var(--gold-light)' }}>
                  <Camera size={34} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Camera Standby</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: 0 }}>
                  Click <strong>Launch Live Mirror</strong> to enable your webcam and start your real-time posture analysis rehearsal.
                </p>
                <button onClick={startLiveCamera} className="btn-primary" style={{ marginTop: '0.5rem', padding: '10px 24px' }}>
                  <Play size={16} /> Enable Camera
                </button>
              </div>
            )}

            {/* Live Floating Shastra HUD Overlay (When Active) */}
            {isCameraActive && (
              <>
                {/* Top-Left: Live Score & Reps Meter */}
                <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(15, 23, 42, 0.90)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', display: 'flex', gap: '16px', alignItems: 'center', zIndex: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Shastra Match</div>
                    <div style={{ fontSize: '1.55rem', fontWeight: 900, color: liveMetrics.overallScore >= 80 ? '#34d399' : (liveMetrics.overallScore >= 60 ? '#fbbf24' : '#fb7185') }}>
                      {liveMetrics.detected ? `${liveMetrics.overallScore}%` : '--'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '14px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Hold Meter</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: holdTimer > 0 ? '#34d399' : '#f8fafc' }}>
                      {holdTimer.toFixed(1)}s <span style={{ fontSize: '0.74rem', color: 'var(--gold-primary)' }}>/ {targetHoldDuration.toFixed(1)}s</span>
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '14px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Reps Done</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                      {repsCompleted}
                    </div>
                  </div>
                </div>

                {/* Top-Right: Target Posture Indicator */}
                <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(15, 23, 42, 0.92)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-primary)', backdropFilter: 'blur(12px)', textAlign: 'right', zIndex: 10 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 800 }}>{selectedTradition}</div>
                  <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 800 }}>{currentPoseObj.label}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--cyan-light)' }}>Target Knee: {currentPoseObj.targetKnee}° | Elbow: {currentPoseObj.targetElbow}°</div>
                </div>

                {/* Bottom Center: Live Corrective Directive Banner */}
                {liveMetrics.feedback.length > 0 && (
                  <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', background: 'rgba(15, 23, 42, 0.94)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: `1px solid ${liveMetrics.overallScore >= 80 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                    {liveMetrics.overallScore >= 80 ? (
                      <CheckCircle2 size={18} color="var(--emerald-primary)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Sparkles size={18} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '0.86rem', color: liveMetrics.overallScore >= 80 ? '#34d399' : '#fef08a', fontWeight: 700 }}>
                      {liveMetrics.feedback[0]}
                    </span>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Action Toolbar: Take Snapshot, Record Take & Save Session */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleTakeSnapshot} 
                disabled={!isCameraActive}
                className="btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Download PNG snapshot of posture"
              >
                <Camera size={15} /> Capture Snapshot
              </button>

              <button 
                onClick={handleToggleRecord} 
                disabled={!isCameraActive}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: isCameraActive ? 'pointer' : 'not-allowed',
                  border: isRecording ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                  background: isRecording ? 'var(--rose-bg)' : '#ffffff',
                  color: isRecording ? '#dc2626' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Video size={15} color={isRecording ? '#dc2626' : 'currentColor'} /> 
                {isRecording ? 'Stop Recording' : 'Record Take'}
              </button>

              <button 
                onClick={handleSaveToVault} 
                disabled={!isCameraActive || isSavingVault}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {saveVaultSuccess ? (
                  <>
                    <Check size={15} /> Saved to Vault!
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save Session
                  </>
                )}
              </button>
            </div>

            {snapshotSuccess && (
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Snapshot saved to Downloads!
              </span>
            )}
          </div>

        </div>

        {/* Right Column: Pose Benchmarks, Tala Keeper & Biomechanical Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Posture Benchmark Selector */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--cyan-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Sliders size={18} color="var(--cyan-primary)" />
              Select Target Benchmark Posture
            </h3>

            {/* Tradition Selector Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.keys(REHEARSAL_POSES).map(trad => (
                <button
                  key={trad}
                  onClick={() => {
                    setSelectedTradition(trad);
                    setSelectedPoseId(REHEARSAL_POSES[trad][0].id);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedTradition === trad ? '1px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                    background: selectedTradition === trad ? 'var(--cyan-bg)' : '#f8fafc',
                    color: selectedTradition === trad ? 'var(--cyan-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {trad}
                </button>
              ))}
            </div>

            {/* Specific Postures for Tradition */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
              {(REHEARSAL_POSES[selectedTradition] || []).map(p => {
                const isSelected = selectedPoseId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPoseId(p.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--gold-bg)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: isSelected ? '0 2px 8px rgba(217, 119, 6, 0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--gold-dark)' : 'var(--text-primary)', display: 'block' }}>{p.label}</strong>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', marginTop: '2px', fontWeight: 600 }}>Mudra: {p.mudra}</div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: isSelected ? 'var(--gold-dark)' : 'var(--text-secondary)', fontWeight: 700, flexShrink: 0, paddingLeft: '8px' }}>
                      Knee: {p.targetKnee}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Joint Telemetry Radar */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--cyan-primary)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '6px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--cyan-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} color="var(--cyan-primary)" />
                Real-Time Joint Telemetry & Approximations
              </h4>
              <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                Approx. (±3°–5°)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.82rem' }}>
              {/* Knees */}
              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Left Knee Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                  ~{liveMetrics.leftKneeAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~{currentPoseObj.targetKnee}°
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Right Knee Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                  ~{liveMetrics.rightKneeAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~{currentPoseObj.targetKnee}°
                </div>
              </div>

              {/* Shoulders */}
              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Left Shoulder Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                  ~{liveMetrics.leftShoulderAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~85°-90°
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Right Shoulder Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                  ~{liveMetrics.rightShoulderAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~85°-90°
                </div>
              </div>

              {/* Wrists */}
              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Left Wrist Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                  ~{liveMetrics.leftWristAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~165°-175°
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Right Wrist Degree</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                  ~{liveMetrics.rightWristAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~165°-175°
                </div>
              </div>

              {/* Elbows */}
              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Left Elbow Frame</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                  ~{liveMetrics.leftElbowAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~{currentPoseObj.targetElbow}°
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Right Elbow Frame</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                  ~{liveMetrics.rightElbowAngle}°
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  Target: ~{currentPoseObj.targetElbow}°
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.8rem', padding: '8px 12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <span>Shoulder Symmetry: <strong style={{ color: 'var(--text-primary)' }}>{liveMetrics.shoulderBalance}</strong></span>
              <span>Central Axis: <strong style={{ color: 'var(--cyan-primary)' }}>{liveMetrics.spineAlignment}</strong></span>
            </div>
            
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic', textAlign: 'center' }}>
              * All knee, shoulder, wrist, and elbow angle values are kinematic approximations (±3°–5°).
            </div>
          </div>

          {/* Integrated Tala Rhythm Metronome */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--gold-primary)', background: '#ffffff', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--gold-dark)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Music size={18} color="var(--gold-primary)" />
                Classical Tala Rhythm Keeper
              </h4>

              <button
                onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: isMetronomePlaying ? '1px solid #f43f5e' : '1px solid var(--gold-primary)',
                  background: isMetronomePlaying ? 'var(--rose-bg)' : 'var(--gold-primary)',
                  color: isMetronomePlaying ? '#dc2626' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isMetronomePlaying ? <Square size={14} /> : <Play size={14} />} 
                {isMetronomePlaying ? 'Pause Tala' : 'Start Tala'}
              </button>
            </div>

            {/* Tala Selection */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(TALAS_CONFIG).map(([tKey, tObj]) => (
                <button
                  key={tKey}
                  onClick={() => {
                    setSelectedTalaKey(tKey);
                    setCurrentBeatIndex(0);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedTalaKey === tKey ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    background: selectedTalaKey === tKey ? 'var(--gold-bg)' : '#f8fafc',
                    color: selectedTalaKey === tKey ? 'var(--gold-dark)' : 'var(--text-secondary)'
                  }}
                >
                  {tObj.name.split(' ')[0]} ({tObj.beats}B)
                </button>
              ))}
            </div>

            {/* Tempo Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: '60px' }}>Tempo:</span>
              <input
                type="range"
                min="40"
                max="160"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.86rem', color: 'var(--gold-dark)', fontWeight: 800, minWidth: '65px', textAlign: 'right' }}>
                {bpm} BPM
              </span>
            </div>

            {/* Dynamic Beat Matrix & Sollukattu Syllable Display */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {currentTalaObj.syllables.map((syl, i) => {
                const isActive = currentBeatIndex === i && isMetronomePlaying;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: isActive ? 'var(--gold-bg)' : '#ffffff',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.1s ease',
                      textAlign: 'center',
                      minWidth: '42px',
                      boxShadow: isActive ? '0 2px 8px rgba(217, 119, 6, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>{i + 1}</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isActive ? 'var(--gold-dark)' : 'var(--text-primary)' }}>{syl}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. How It Works Quick Guide Modal */}
      {showGuideModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--gold-primary)', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--gold-primary)" />
                Mastering the Live AI Rehearsal Mirror
              </h3>
              <button onClick={() => setShowGuideModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-bg)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0, border: '1px solid #fde68a' }}>1</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Camera Positioning:</strong> Step back 2.5 to 3 meters so your full body from head to toes is clearly visible in the camera frame.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-bg)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0, border: '1px solid #fde68a' }}>2</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Align with Ghost Guide:</strong> Step into the golden target silhouette. Keep your knees flexed outward and arms at shoulder height to match the selected posture benchmark.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-bg)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0, border: '1px solid #fde68a' }}>3</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Hold for Repetition:</strong> When your alignment reaches 80%+, the Hold Meter counts down from 3.0s. Holding the posture completes a repetition and adds to your score.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-bg)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0, border: '1px solid #fde68a' }}>4</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Save to Vault:</strong> Click "Save Session" at any time to preserve your rehearsal metrics, reps, and corrective feedback in your Analysis Vault.
                </div>
              </div>
            </div>

            <button onClick={() => setShowGuideModal(false)} className="btn-primary" style={{ padding: '10px', marginTop: '0.5rem', width: '100%' }}>
              Got It, Let's Rehearse!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
