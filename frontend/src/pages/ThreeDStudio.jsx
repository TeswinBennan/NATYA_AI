import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  RotateCw, 
  Download, 
  Layers, 
  Activity, 
  Eye, 
  Move3d, 
  CheckCircle, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  ShieldCheck, 
  Flame, 
  Palette, 
  Filter, 
  BookOpen, 
  Search,
  Maximize2,
  Video,
  Film,
  Play,
  Square,
  Upload,
  FileJson,
  X,
  Share2,
  Sliders,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const POSES_CONFIG = {
  // --- BHARATANATYAM ---
  Aramandi: {
    name: 'Aramandi / Natyarambha',
    tradition: 'Bharatanatyam',
    region: 'Tamil Nadu',
    mudra: 'Pataka & Tripataka',
    difficulty: 'Fundamental',
    description: 'Diamond half-squat with 180° outward knee turnout and horizontal arm extension.',
    ideal_angles: { leftKnee: 120, rightKnee: 120, leftElbow: 160, rightElbow: 160, spinePitch: 90 },
    tips: ['Keep heels together and knees pointing outward laterally.', 'Maintain an erect spine without forward pelvic tilt.', 'Keep elbows elevated in line with shoulders.'],
    joints: [
      new THREE.Vector3(0, 0, 0),          // 0: Pelvis
      new THREE.Vector3(0, 0.45, 0),       // 1: Spine Mid
      new THREE.Vector3(0, 0.85, 0),       // 2: Neck
      new THREE.Vector3(0, 1.2, 0),        // 3: Head
      // Left Arm
      new THREE.Vector3(-0.35, 0.8, 0),    // 4: L Shoulder
      new THREE.Vector3(-0.75, 0.75, 0.1), // 5: L Elbow
      new THREE.Vector3(-1.05, 0.95, 0.2), // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.35, 0.8, 0),     // 7: R Shoulder
      new THREE.Vector3(0.75, 0.75, 0.1),  // 8: R Elbow
      new THREE.Vector3(1.05, 0.95, 0.2),  // 9: R Wrist
      // Left Leg (Aramandi Half Sit)
      new THREE.Vector3(-0.25, -0.1, 0),   // 10: L Hip
      new THREE.Vector3(-0.65, -0.55, 0),  // 11: L Knee (Bent wide)
      new THREE.Vector3(-0.35, -1.15, 0),  // 12: L Ankle
      // Right Leg (Aramandi Half Sit)
      new THREE.Vector3(0.25, -0.1, 0),    // 13: R Hip
      new THREE.Vector3(0.65, -0.55, 0),   // 14: R Knee (Bent wide)
      new THREE.Vector3(0.35, -1.15, 0),   // 15: R Ankle
    ]
  },
  Natarajasana: {
    name: 'Ananda Tandavam (Natarajasana)',
    tradition: 'Bharatanatyam',
    region: 'Tamil Nadu',
    mudra: 'Abhaya & Gajahasta',
    difficulty: 'Advanced Master',
    description: 'Iconic Cosmic Shiva dance pose with lifted crossed left leg, Gajahasta diagonal sweep, and Abhaya Mudra.',
    ideal_angles: { leftKnee: 65, rightKnee: 155, leftElbow: 135, rightElbow: 90, spinePitch: 86 },
    tips: ['Ground weight firmly on the right standing leg with subtle knee spring.', 'Sweep the left arm diagonally across chest in Gajahasta pointing to raised foot.', 'Hold the right arm high in Abhaya Mudra of fearlessness.'],
    joints: [
      new THREE.Vector3(0, 0.1, 0),         // 0: Pelvis
      new THREE.Vector3(0.02, 0.55, 0.05),  // 1: Spine Mid
      new THREE.Vector3(0.05, 0.95, 0.05),  // 2: Neck
      new THREE.Vector3(0.08, 1.3, 0.05),   // 3: Head
      // Left Arm (Gajahasta sweep across chest)
      new THREE.Vector3(-0.3, 0.9, 0.05),   // 4: L Shoulder
      new THREE.Vector3(-0.1, 0.7, 0.25),   // 5: L Elbow
      new THREE.Vector3(0.35, 0.55, 0.35),  // 6: L Wrist
      // Right Arm (Abhaya mudra high)
      new THREE.Vector3(0.35, 0.9, 0.05),   // 7: R Shoulder
      new THREE.Vector3(0.75, 1.1, 0.1),    // 8: R Elbow
      new THREE.Vector3(0.9, 1.35, 0.15),   // 9: R Wrist
      // Left Leg (Lifted & crossed high)
      new THREE.Vector3(-0.2, 0.05, 0.05),  // 10: L Hip
      new THREE.Vector3(0.3, 0.1, 0.3),     // 11: L Knee
      new THREE.Vector3(0.65, -0.2, 0.35),  // 12: L Ankle
      // Right Leg (Grounded standing leg)
      new THREE.Vector3(0.2, 0.05, 0),      // 13: R Hip
      new THREE.Vector3(0.22, -0.5, 0),     // 14: R Knee
      new THREE.Vector3(0.2, -1.15, 0),     // 15: R Ankle
    ]
  },
  Muzhumandi: {
    name: 'Muzhumandi (Full Seated Stance)',
    tradition: 'Bharatanatyam',
    region: 'Tamil Nadu',
    mudra: 'Katakamuha & Dola',
    difficulty: 'Intermediate',
    description: 'Full deep squat balanced on the balls of the feet with maximum lateral hip rotation and upright spine.',
    ideal_angles: { leftKnee: 60, rightKnee: 60, leftElbow: 130, rightElbow: 130, spinePitch: 90 },
    tips: ['Keep back completely vertical without slouching.', 'Heels remain raised with weight balanced over the balls of the feet.', 'Knees flare out 180 degrees horizontally.'],
    joints: [
      new THREE.Vector3(0, -0.55, 0),       // 0: Pelvis
      new THREE.Vector3(0, -0.1, 0),        // 1: Spine Mid
      new THREE.Vector3(0, 0.3, 0),         // 2: Neck
      new THREE.Vector3(0, 0.65, 0),        // 3: Head
      // Left Arm
      new THREE.Vector3(-0.35, 0.25, 0),    // 4: L Shoulder
      new THREE.Vector3(-0.65, 0.15, 0.1),  // 5: L Elbow
      new THREE.Vector3(-0.4, 0.1, 0.2),    // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.35, 0.25, 0),     // 7: R Shoulder
      new THREE.Vector3(0.65, 0.15, 0.1),   // 8: R Elbow
      new THREE.Vector3(0.4, 0.1, 0.2),     // 9: R Wrist
      // Left Leg (Full deep squat)
      new THREE.Vector3(-0.2, -0.6, 0),     // 10: L Hip
      new THREE.Vector3(-0.75, -0.7, 0.1),  // 11: L Knee
      new THREE.Vector3(-0.15, -1.15, 0),   // 12: L Ankle
      // Right Leg (Full deep squat)
      new THREE.Vector3(0.2, -0.6, 0),      // 13: R Hip
      new THREE.Vector3(0.75, -0.7, 0.1),   // 14: R Knee
      new THREE.Vector3(0.15, -1.15, 0),    // 15: R Ankle
    ]
  },
  Alidha: {
    name: 'Alidha Stance (Warrior Archer)',
    tradition: 'Bharatanatyam',
    region: 'South India',
    mudra: 'Shikhara & Dhanur-Mudra',
    difficulty: 'Advanced',
    description: 'Dynamic heroic martial stance where one leg lunges forward and the other extends straight back drawing the mythical bow.',
    ideal_angles: { leftKnee: 165, rightKnee: 110, leftElbow: 170, rightElbow: 55, spinePitch: 85 },
    tips: ['Front knee flexed at a sharp dynamic angle over ankle.', 'Rear leg locked straight into the floor.', 'Chest opened wide along the arrow axis.'],
    joints: [
      new THREE.Vector3(0, -0.15, 0),       // 0: Pelvis
      new THREE.Vector3(0.1, 0.3, 0.05),    // 1: Spine Mid
      new THREE.Vector3(0.15, 0.7, 0.05),   // 2: Neck
      new THREE.Vector3(0.2, 1.05, 0.05),   // 3: Head
      // Left Arm (Holding bow forward)
      new THREE.Vector3(-0.2, 0.65, 0.1),   // 4: L Shoulder
      new THREE.Vector3(-0.6, 0.75, 0.25),  // 5: L Elbow
      new THREE.Vector3(-1.0, 0.85, 0.3),   // 6: L Wrist
      // Right Arm (Pulling string to ear)
      new THREE.Vector3(0.4, 0.65, 0.05),   // 7: R Shoulder
      new THREE.Vector3(0.6, 0.6, -0.15),   // 8: R Elbow
      new THREE.Vector3(0.25, 0.7, -0.05),  // 9: R Wrist
      // Left Leg (Stretched back)
      new THREE.Vector3(-0.2, -0.2, -0.1),  // 10: L Hip
      new THREE.Vector3(-0.75, -0.65, -0.2),// 11: L Knee
      new THREE.Vector3(-1.1, -1.15, -0.3), // 12: L Ankle
      // Right Leg (Deep forward lunge)
      new THREE.Vector3(0.2, -0.2, 0.1),    // 13: R Hip
      new THREE.Vector3(0.55, -0.7, 0.2),   // 14: R Knee
      new THREE.Vector3(0.45, -1.15, 0.2),  // 15: R Ankle
    ]
  },

  // --- KUCHIPUDI & ODISSI ---
  Tribhanga: {
    name: 'Tribhanga (Kuchipudi / Odissi S-Curve)',
    tradition: 'Kuchipudi',
    region: 'Andhra Pradesh / Odisha',
    mudra: 'Alapadma & Suchi',
    difficulty: 'Intermediate',
    description: 'Signature three-bend body posture creating a lyrical S-curve silhouette at neck, waist, and knee.',
    ideal_angles: { leftKnee: 130, rightKnee: 145, leftElbow: 125, rightElbow: 150, spinePitch: 78 },
    tips: ['Deflect the pelvic center gracefully to one side.', 'Counter-tilt the chest and head to establish balance.', 'Rest one hand firmly on the waist while raising the other in Alapadma.'],
    joints: [
      new THREE.Vector3(0.1, 0, 0),         // 0: Pelvis (Shifted right)
      new THREE.Vector3(-0.08, 0.45, 0),    // 1: Spine Mid (Shifted left)
      new THREE.Vector3(0.08, 0.85, 0),     // 2: Neck (Shifted right)
      new THREE.Vector3(0.12, 1.2, 0),      // 3: Head (Tilted)
      // Left Arm (Hand on waist)
      new THREE.Vector3(-0.28, 0.8, 0),     // 4: L Shoulder
      new THREE.Vector3(-0.55, 0.5, 0.15),  // 5: L Elbow
      new THREE.Vector3(-0.25, 0.3, 0.1),   // 6: L Wrist
      // Right Arm (Raised high in Alapadma)
      new THREE.Vector3(0.42, 0.8, 0),      // 7: R Shoulder
      new THREE.Vector3(0.85, 1.0, 0.15),   // 8: R Elbow
      new THREE.Vector3(0.7, 1.3, 0.2),     // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.15, -0.1, 0),    // 10: L Hip
      new THREE.Vector3(-0.45, -0.6, 0.1),  // 11: L Knee
      new THREE.Vector3(-0.25, -1.2, 0),    // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.35, -0.1, 0),     // 13: R Hip
      new THREE.Vector3(0.3, -0.6, -0.1),   // 14: R Knee
      new THREE.Vector3(0.2, -1.2, 0),      // 15: R Ankle
    ]
  },
  MandukaShabdam: {
    name: 'Manduka Shabdam (Frog Rhythm Crouch)',
    tradition: 'Kuchipudi',
    region: 'Andhra Pradesh',
    mudra: 'Kartarimukha & Hamsasya',
    difficulty: 'Intermediate',
    description: 'Dynamic rhythmic crouch representing the Gajendra Moksha and frog folklore narrative with elastic arm flares.',
    ideal_angles: { leftKnee: 90, rightKnee: 90, leftElbow: 140, rightElbow: 140, spinePitch: 82 },
    tips: ['Lower the pelvic gravity center evenly.', 'Flare both arms outward symmetrically with crisp finger mudras.', 'Maintain spring-like flexibility in knees for sudden leaps.'],
    joints: [
      new THREE.Vector3(0, -0.3, 0),        // 0: Pelvis
      new THREE.Vector3(0, 0.15, 0.05),     // 1: Spine Mid
      new THREE.Vector3(0, 0.55, 0.05),     // 2: Neck
      new THREE.Vector3(0, 0.9, 0.05),      // 3: Head
      // Left Arm
      new THREE.Vector3(-0.35, 0.5, 0),     // 4: L Shoulder
      new THREE.Vector3(-0.7, 0.4, 0.15),   // 5: L Elbow
      new THREE.Vector3(-0.95, 0.65, 0.25), // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.35, 0.5, 0),      // 7: R Shoulder
      new THREE.Vector3(0.7, 0.4, 0.15),    // 8: R Elbow
      new THREE.Vector3(0.95, 0.65, 0.25),  // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.25, -0.35, 0),   // 10: L Hip
      new THREE.Vector3(-0.7, -0.7, 0.15),  // 11: L Knee
      new THREE.Vector3(-0.5, -1.15, 0),    // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.25, -0.35, 0),    // 13: R Hip
      new THREE.Vector3(0.7, -0.7, 0.15),   // 14: R Knee
      new THREE.Vector3(0.5, -1.15, 0),     // 15: R Ankle
    ]
  },

  // --- KATHAKALI ---
  KathakaliKalasam: {
    name: 'Kalasam (Heroic Martial Stance)',
    tradition: 'Kathakali',
    region: 'Kerala',
    mudra: 'Mudrakhya & Pataka',
    difficulty: 'Advanced Heavy',
    description: 'Powerful wide grounded posture with chest thrust forward and wide-bent square arms characteristic of heroic Paccha characters.',
    ideal_angles: { leftKnee: 115, rightKnee: 115, leftElbow: 90, rightElbow: 90, spinePitch: 88 },
    tips: ['Stand on the outer edges of the arched feet.', 'Square the elbows at rigid 90-degree right angles.', 'Project the chest outwards while locking core stability.'],
    joints: [
      new THREE.Vector3(0, -0.2, 0),        // 0: Pelvis
      new THREE.Vector3(0, 0.25, 0.08),     // 1: Spine Mid
      new THREE.Vector3(0, 0.7, 0.08),      // 2: Neck
      new THREE.Vector3(0, 1.05, 0.08),     // 3: Head
      // Left Arm (Square martial frame)
      new THREE.Vector3(-0.45, 0.65, 0.05), // 4: L Shoulder
      new THREE.Vector3(-0.85, 0.65, 0.2),  // 5: L Elbow
      new THREE.Vector3(-0.45, 0.65, 0.3),  // 6: L Wrist
      // Right Arm (Square martial frame)
      new THREE.Vector3(0.45, 0.65, 0.05),  // 7: R Shoulder
      new THREE.Vector3(0.85, 0.65, 0.2),   // 8: R Elbow
      new THREE.Vector3(0.45, 0.65, 0.3),   // 9: R Wrist
      // Left Leg (Wide Kathakali stance)
      new THREE.Vector3(-0.3, -0.25, 0),    // 10: L Hip
      new THREE.Vector3(-0.8, -0.65, 0.1),  // 11: L Knee
      new THREE.Vector3(-0.55, -1.15, 0),   // 12: L Ankle
      // Right Leg (Wide Kathakali stance)
      new THREE.Vector3(0.3, -0.25, 0),     // 13: R Hip
      new THREE.Vector3(0.8, -0.65, 0.1),   // 14: R Knee
      new THREE.Vector3(0.55, -1.15, 0),    // 15: R Ankle
    ]
  },
  PakarchaStance: {
    name: 'Pakarcha (Dramatic Avatar Shift)',
    tradition: 'Kathakali',
    region: 'Kerala',
    mudra: 'Katakam & Simhamukha',
    difficulty: 'Intermediate',
    description: 'Dramatic dual-role transformation pose with asymmetric upper body torque and expressive mudra elevations.',
    ideal_angles: { leftKnee: 135, rightKnee: 125, leftElbow: 110, rightElbow: 60, spinePitch: 84 },
    tips: ['Shift gaze and head sharply in the direction of the upper mudra.', 'Contract the torso muscles to hold high dramatic tension.', 'Keep legs anchored low into the earth.'],
    joints: [
      new THREE.Vector3(-0.1, -0.15, 0),    // 0: Pelvis
      new THREE.Vector3(-0.05, 0.3, 0.05),  // 1: Spine Mid
      new THREE.Vector3(0.05, 0.75, 0.05),  // 2: Neck
      new THREE.Vector3(0.15, 1.1, 0.1),    // 3: Head
      // Left Arm (Raised high)
      new THREE.Vector3(-0.38, 0.7, 0),     // 4: L Shoulder
      new THREE.Vector3(-0.75, 0.85, 0.2),  // 5: L Elbow
      new THREE.Vector3(-0.5, 1.1, 0.3),    // 6: L Wrist
      // Right Arm (Drawn low)
      new THREE.Vector3(0.38, 0.7, 0),      // 7: R Shoulder
      new THREE.Vector3(0.6, 0.35, 0.15),   // 8: R Elbow
      new THREE.Vector3(0.3, 0.1, 0.25),    // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.28, -0.2, 0),    // 10: L Hip
      new THREE.Vector3(-0.65, -0.6, 0.1),  // 11: L Knee
      new THREE.Vector3(-0.4, -1.15, 0),    // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.28, -0.2, 0),     // 13: R Hip
      new THREE.Vector3(0.6, -0.7, -0.1),   // 14: R Knee
      new THREE.Vector3(0.45, -1.15, 0),    // 15: R Ankle
    ]
  },

  // --- KATHAK ---
  KathakSama: {
    name: 'Sama Stance & Hastak (Kathak Poise)',
    tradition: 'Kathak',
    region: 'North India',
    mudra: 'Pataka & Ardhapataka',
    difficulty: 'Fundamental',
    description: 'Upright vertical spinal axis with rotating wrist flourishes, embodying calm dignity and precision.',
    ideal_angles: { leftKnee: 175, rightKnee: 175, leftElbow: 135, rightElbow: 110, spinePitch: 90 },
    tips: ['Maintain an elongated vertical spine from coccyx through crown of head.', 'Keep legs straight without hyper-extending knees.', 'Animate wrists with gentle rotational Hastak.'],
    joints: [
      new THREE.Vector3(0, 0, 0),           // 0: Pelvis
      new THREE.Vector3(0, 0.5, 0),         // 1: Spine Mid
      new THREE.Vector3(0, 0.95, 0),        // 2: Neck
      new THREE.Vector3(0, 1.3, 0),         // 3: Head
      // Left Arm (Curving overhead)
      new THREE.Vector3(-0.35, 0.9, 0),     // 4: L Shoulder
      new THREE.Vector3(-0.65, 1.1, 0.1),   // 5: L Elbow
      new THREE.Vector3(-0.85, 1.35, 0.15), // 6: L Wrist
      // Right Arm (Curving downward)
      new THREE.Vector3(0.35, 0.9, 0),      // 7: R Shoulder
      new THREE.Vector3(0.65, 0.6, 0.1),    // 8: R Elbow
      new THREE.Vector3(0.85, 0.3, 0.15),   // 9: R Wrist
      // Left Leg (Straight stance)
      new THREE.Vector3(-0.2, -0.1, 0),     // 10: L Hip
      new THREE.Vector3(-0.22, -0.65, 0),   // 11: L Knee
      new THREE.Vector3(-0.22, -1.2, 0),    // 12: L Ankle
      // Right Leg (Straight stance)
      new THREE.Vector3(0.2, -0.1, 0),      // 13: R Hip
      new THREE.Vector3(0.22, -0.65, 0),    // 14: R Knee
      new THREE.Vector3(0.22, -1.2, 0),     // 15: R Ankle
    ]
  },
  ChakkarSpin: {
    name: 'Chakkar Spin Preparation (Pirouette)',
    tradition: 'Kathak',
    region: 'North India',
    mudra: 'Pataka Spiral',
    difficulty: 'Advanced',
    description: 'Dynamic rotational spiral posture coiled ready to execute rapid lightning pirouettes across the stage.',
    ideal_angles: { leftKnee: 170, rightKnee: 165, leftElbow: 130, rightElbow: 155, spinePitch: 89 },
    tips: ['Spot your focal point directly ahead before launching the spin.', 'Torso muscles engaged to retain gyroscopic balance.', 'Arms sweep in wide horizontal planes.'],
    joints: [
      new THREE.Vector3(0, 0.05, 0),        // 0: Pelvis
      new THREE.Vector3(0.05, 0.5, 0.02),   // 1: Spine Mid
      new THREE.Vector3(0.08, 0.92, 0.02),  // 2: Neck
      new THREE.Vector3(0.1, 1.28, 0.05),   // 3: Head
      // Left Arm
      new THREE.Vector3(-0.35, 0.88, 0.1),  // 4: L Shoulder
      new THREE.Vector3(-0.75, 0.85, 0.25), // 5: L Elbow
      new THREE.Vector3(-1.0, 0.75, 0.35),  // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.35, 0.88, -0.1),  // 7: R Shoulder
      new THREE.Vector3(0.65, 0.95, -0.2),  // 8: R Elbow
      new THREE.Vector3(0.9, 1.05, -0.25),  // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.18, -0.05, 0),   // 10: L Hip
      new THREE.Vector3(-0.2, -0.6, 0.05),  // 11: L Knee
      new THREE.Vector3(-0.2, -1.15, 0.05), // 12: L Ankle
      // Right Leg (Crossed behind for spin)
      new THREE.Vector3(0.18, -0.05, -0.1), // 13: R Hip
      new THREE.Vector3(0.05, -0.6, -0.2),  // 14: R Knee
      new THREE.Vector3(-0.05, -1.15, -0.25)// 15: R Ankle
    ]
  },
  TatkarStance: {
    name: 'Tatkar Footwork Base',
    tradition: 'Kathak',
    region: 'North India',
    mudra: 'Mushti / Chest Hastak',
    difficulty: 'Fundamental',
    description: 'Solid rhythmic stance ready for fast percussive Ghungroo heel strikes with hands poised gracefully at chest level.',
    ideal_angles: { leftKnee: 165, rightKnee: 165, leftElbow: 100, rightElbow: 100, spinePitch: 90 },
    tips: ['Distribute weight evenly across the soles.', 'Keep knees subtly soft to absorb heel strike impact.', 'Torso held high and still while feet articulate complex rhythmic tihais.'],
    joints: [
      new THREE.Vector3(0, 0, 0),           // 0: Pelvis
      new THREE.Vector3(0, 0.48, 0),        // 1: Spine Mid
      new THREE.Vector3(0, 0.9, 0),         // 2: Neck
      new THREE.Vector3(0, 1.25, 0),        // 3: Head
      // Left Arm
      new THREE.Vector3(-0.35, 0.85, 0),    // 4: L Shoulder
      new THREE.Vector3(-0.6, 0.7, 0.2),    // 5: L Elbow
      new THREE.Vector3(-0.25, 0.65, 0.25), // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.35, 0.85, 0),     // 7: R Shoulder
      new THREE.Vector3(0.6, 0.7, 0.2),     // 8: R Elbow
      new THREE.Vector3(0.25, 0.65, 0.25),  // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.2, -0.1, 0),     // 10: L Hip
      new THREE.Vector3(-0.25, -0.6, 0),    // 11: L Knee
      new THREE.Vector3(-0.25, -1.15, 0),   // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.2, -0.1, 0),      // 13: R Hip
      new THREE.Vector3(0.25, -0.6, 0),     // 14: R Knee
      new THREE.Vector3(0.25, -1.15, 0),    // 15: R Ankle
    ]
  },

  // --- MOHINIYATTAM ---
  MohiniyattamAndolika: {
    name: 'Andolika (Lasya Torso Sway)',
    tradition: 'Mohiniyattam',
    region: 'Kerala',
    mudra: 'Hamsasya & Mudrakhya',
    difficulty: 'Intermediate',
    description: 'Delicate circular swaying posture reminiscent of palm fronds in Kerala backwaters with gentle undulating torso curves.',
    ideal_angles: { leftKnee: 135, rightKnee: 140, leftElbow: 130, rightElbow: 145, spinePitch: 84 },
    tips: ['Torso follows a subtle continuous figure-8 infinity wave.', 'Never allow abrupt angular breaks; maintain unbroken feminine Lasya.', 'Soften eye expressions downward.'],
    joints: [
      new THREE.Vector3(-0.08, -0.05, 0),   // 0: Pelvis
      new THREE.Vector3(0.06, 0.42, 0.02),  // 1: Spine Mid
      new THREE.Vector3(-0.04, 0.82, 0.02), // 2: Neck
      new THREE.Vector3(-0.08, 1.18, 0.03), // 3: Head
      // Left Arm
      new THREE.Vector3(-0.38, 0.78, 0.05), // 4: L Shoulder
      new THREE.Vector3(-0.75, 0.65, 0.15), // 5: L Elbow
      new THREE.Vector3(-0.95, 0.45, 0.2),  // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.32, 0.8, 0),      // 7: R Shoulder
      new THREE.Vector3(0.68, 0.95, 0.15),  // 8: R Elbow
      new THREE.Vector3(0.5, 1.2, 0.25),    // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.25, -0.15, 0),   // 10: L Hip
      new THREE.Vector3(-0.45, -0.65, 0.08),// 11: L Knee
      new THREE.Vector3(-0.3, -1.15, 0),    // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.2, -0.15, 0),     // 13: R Hip
      new THREE.Vector3(0.45, -0.65, -0.05),// 14: R Knee
      new THREE.Vector3(0.25, -1.15, 0),    // 15: R Ankle
    ]
  },
  Cholkettu: {
    name: 'Cholkettu Salutation (Anjali Arpanam)',
    tradition: 'Mohiniyattam',
    region: 'Kerala',
    mudra: 'Anjali Mudra',
    difficulty: 'Fundamental',
    description: 'Introductory devotional salutation with palms pressed in Anjali Mudra at heart center and gentle knee flexion.',
    ideal_angles: { leftKnee: 140, rightKnee: 140, leftElbow: 75, rightElbow: 75, spinePitch: 88 },
    tips: ['Hands joined softly without tension in wrists.', 'Gentle inward bow of the head conveying profound respect to Nataraja and Guru.', 'Breathe rhythmically with the tala.'],
    joints: [
      new THREE.Vector3(0, -0.05, 0),       // 0: Pelvis
      new THREE.Vector3(0, 0.42, 0.04),     // 1: Spine Mid
      new THREE.Vector3(0, 0.82, 0.04),     // 2: Neck
      new THREE.Vector3(0, 1.18, 0.08),     // 3: Head
      // Left Arm
      new THREE.Vector3(-0.32, 0.78, 0.02), // 4: L Shoulder
      new THREE.Vector3(-0.45, 0.55, 0.2),  // 5: L Elbow
      new THREE.Vector3(-0.05, 0.6, 0.3),   // 6: L Wrist
      // Right Arm
      new THREE.Vector3(0.32, 0.78, 0.02),  // 7: R Shoulder
      new THREE.Vector3(0.45, 0.55, 0.2),   // 8: R Elbow
      new THREE.Vector3(0.05, 0.6, 0.3),    // 9: R Wrist
      // Left Leg
      new THREE.Vector3(-0.2, -0.12, 0),    // 10: L Hip
      new THREE.Vector3(-0.35, -0.62, 0.05),// 11: L Knee
      new THREE.Vector3(-0.25, -1.15, 0),   // 12: L Ankle
      // Right Leg
      new THREE.Vector3(0.2, -0.12, 0),     // 13: R Hip
      new THREE.Vector3(0.35, -0.62, 0.05), // 14: R Knee
      new THREE.Vector3(0.25, -1.15, 0),    // 15: R Ankle
    ]
  }
};

const BONES_PAIRS = [
  // Spine & Head
  [0, 1], [1, 2], [2, 3],
  // Shoulders & Arms
  [2, 4], [4, 5], [5, 6],
  [2, 7], [7, 8], [8, 9],
  // Pelvis & Legs
  [0, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15]
];

const THEMES = {
  gold: {
    name: 'Temple Gold',
    jointColor: 0xfef08a,
    jointEmissive: 0xf59e0b,
    boneColor: 0xfbbf24,
    lightColor: 0xf59e0b,
    badgeClass: 'badge-gold'
  },
  cyan: {
    name: 'Peacock Hologram',
    jointColor: 0xa5f3fc,
    jointEmissive: 0x06b6d4,
    boneColor: 0x38bdf8,
    lightColor: 0x0284c7,
    badgeClass: 'badge-peacock'
  },
  ruby: {
    name: 'Ruby Tandava',
    jointColor: 0xfecdd3,
    jointEmissive: 0xf43f5e,
    boneColor: 0xfb7185,
    lightColor: 0xe11d48,
    badgeClass: 'badge-maroon'
  },
  emerald: {
    name: 'Emerald Lasya',
    jointColor: 0xa7f3d0,
    jointEmissive: 0x10b981,
    boneColor: 0x34d399,
    lightColor: 0x059669,
    badgeClass: 'badge-gold'
  },
  violet: {
    name: 'Cosmic Violet',
    jointColor: 0xe9d5ff,
    jointEmissive: 0xa855f7,
    boneColor: 0xc084fc,
    lightColor: 0x9333ea,
    badgeClass: 'badge-purple'
  }
};

const TRADITION_FILTERS = [
  'All',
  'Bharatanatyam',
  'Kuchipudi',
  'Kathakali',
  'Kathak',
  'Mohiniyattam'
];

export default function ThreeDStudio() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedPoseKey, setSelectedPoseKey] = useState('Aramandi');
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState('gold');
  const [orbitSpeed, setOrbitSpeed] = useState(1); // 0 = pause, 1 = normal, 2 = fast
  const [exportedSuccess, setExportedSuccess] = useState(false);
  const [customPose, setCustomPose] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordMode, setRecordMode] = useState(null); // 'turntable' | 'sequence' | 'manual'
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordTimerText, setRecordTimerText] = useState('00:00');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [recordedVideoMeta, setRecordedVideoMeta] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Sequence Playback state
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const sequenceIntervalRef = useRef(null);

  // References for Three.js objects
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const skeletonGroupRef = useRef(null);
  const jointMeshesRef = useRef([]);
  const boneLinesRef = useRef([]);
  const targetJointPositionsRef = useRef(POSES_CONFIG['Aramandi'].joints.map(j => j.clone()));

  // Turntable Video Generation Control
  const turntableRecordStateRef = useRef({
    active: false,
    durationMs: 6000,
    startTime: 0,
    initialRotation: 0
  });

  // MediaRecorder Reference
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);

  // Mouse drag orbit controls
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Get active pose object (support custom uploaded pose)
  const activePose = customPose && selectedPoseKey === 'Custom' 
    ? customPose 
    : (POSES_CONFIG[selectedPoseKey] || POSES_CONFIG.Aramandi);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 640;
    const height = currentMount.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 3.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer with preserveDrawingBuffer enabled for canvas recording
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const theme = THEMES[currentTheme] || THEMES.gold;
    const mainLight = new THREE.PointLight(theme.lightColor, 3.5, 25);
    mainLight.position.set(3, 4, 3);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x0284c7, 2, 25);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0xfbbf24, 1.5, 20);
    backLight.position.set(0, 3, -3);
    scene.add(backLight);

    // 5. Circular Lotus Floor Grid
    const grid = new THREE.GridHelper(6, 12, 0xf59e0b, 0x1e293b);
    grid.position.y = -1.25;
    scene.add(grid);

    // Subtle floor glow ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: theme.jointEmissive, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.14 
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.24;
    scene.add(ringMesh);

    // 6. Skeleton Group
    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);
    skeletonGroupRef.current = skeletonGroup;

    // 7. Joint Meshes & Materials
    const initialPose = POSES_CONFIG[selectedPoseKey] || POSES_CONFIG.Aramandi;
    targetJointPositionsRef.current = initialPose.joints.map(j => j.clone());

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: theme.jointColor,
      emissive: theme.jointEmissive,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.85
    });

    const boneMaterial = new THREE.LineBasicMaterial({
      color: theme.boneColor,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });

    jointMeshesRef.current = [];
    boneLinesRef.current = [];

    initialPose.joints.forEach((pos, i) => {
      const radius = (i === 3) ? 0.085 : (i === 0 ? 0.07 : 0.05);
      const geo = new THREE.SphereGeometry(radius, 20, 20);
      const mesh = new THREE.Mesh(geo, jointMaterial);
      mesh.position.copy(pos);
      skeletonGroup.add(mesh);
      jointMeshesRef.current.push(mesh);
    });

    // Create 15 Bone Connectors
    BONES_PAIRS.forEach(([a, b]) => {
      const points = [initialPose.joints[a], initialPose.joints[b]];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, boneMaterial);
      skeletonGroup.add(line);
      boneLinesRef.current.push(line);
    });

    // 8. Continuous Animation Loop with Smooth Skeletal Morphing Lerp
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smoothly interpolate joint positions towards target posture
      const targets = targetJointPositionsRef.current;
      jointMeshesRef.current.forEach((mesh, idx) => {
        if (targets[idx]) {
          mesh.position.lerp(targets[idx], 0.12);
        }
      });

      // Update bone lines to match dynamically moving joint meshes
      BONES_PAIRS.forEach(([a, b], idx) => {
        const line = boneLinesRef.current[idx];
        const meshA = jointMeshesRef.current[a];
        const meshB = jointMeshesRef.current[b];
        if (line && meshA && meshB) {
          const posAttr = line.geometry.attributes.position;
          posAttr.setXYZ(0, meshA.position.x, meshA.position.y, meshA.position.z);
          posAttr.setXYZ(1, meshB.position.x, meshB.position.y, meshB.position.z);
          posAttr.needsUpdate = true;
        }
      });

      // Turntable Automated 360 Spin Video Animation
      if (turntableRecordStateRef.current.active && skeletonGroupRef.current) {
        const { startTime, durationMs } = turntableRecordStateRef.current;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        skeletonGroupRef.current.rotation.y = progress * 2 * Math.PI;
        setRecordProgress(Math.round(progress * 100));

        if (progress >= 1) {
          turntableRecordStateRef.current.active = false;
          stopRecording();
        }
      } else if (orbitSpeed > 0 && !isDraggingRef.current && skeletonGroupRef.current) {
        // Normal Auto-rotation
        skeletonGroupRef.current.rotation.y += 0.006 * orbitSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse & Touch Drag Controls
    const onMouseDown = (e) => {
      if (turntableRecordStateRef.current.active) return;
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !skeletonGroupRef.current || turntableRecordStateRef.current.active) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      skeletonGroupRef.current.rotation.y += deltaX * 0.009;
      skeletonGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, skeletonGroupRef.current.rotation.x + deltaY * 0.005));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Zoom on wheel
    const onWheel = (e) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(2.0, Math.min(6.5, cameraRef.current.position.z + e.deltaY * 0.003));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!currentMount || !rendererRef.current || !cameraRef.current) return;
      const w = currentMount.clientWidth || 640;
      const h = currentMount.clientHeight || 520;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount && renderer.domElement) {
        currentMount.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // Update Theme Colors Dynamically
  useEffect(() => {
    const theme = THEMES[currentTheme] || THEMES.gold;

    if (jointMeshesRef.current.length > 0) {
      const newJointMat = new THREE.MeshStandardMaterial({
        color: theme.jointColor,
        emissive: theme.jointEmissive,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.85
      });
      jointMeshesRef.current.forEach(mesh => {
        mesh.material = newJointMat;
      });
    }

    if (boneLinesRef.current.length > 0) {
      const newBoneMat = new THREE.LineBasicMaterial({
        color: theme.boneColor,
        linewidth: 3,
        transparent: true,
        opacity: 0.95
      });
      boneLinesRef.current.forEach(line => {
        line.material = newBoneMat;
      });
    }
  }, [currentTheme]);

  // Morph to New Selected Pose
  const switchPose = (poseKey) => {
    setSelectedPoseKey(poseKey);
    let targetPose = null;
    if (poseKey === 'Custom' && customPose) {
      targetPose = customPose;
    } else {
      targetPose = POSES_CONFIG[poseKey];
    }

    if (targetPose && targetPose.joints) {
      targetJointPositionsRef.current = targetPose.joints.map(j => j.clone ? j.clone() : new THREE.Vector3(j.x, j.y, j.z));
    }
  };

  // Camera Helper Controls
  const handleZoom = (direction) => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? -0.4 : 0.4;
    cameraRef.current.position.z = Math.max(2.0, Math.min(6.5, cameraRef.current.position.z + factor));
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !skeletonGroupRef.current) return;
    cameraRef.current.position.set(0, 0.35, 3.8);
    skeletonGroupRef.current.rotation.set(0, 0, 0);
  };

  // =========================================================================
  // 1. VIDEO RECORDING ENGINE FOR 3D TWIN (CANVAS STREAM & MEDIARECORDER)
  // =========================================================================

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  };

  const startCanvasRecording = (mode = 'manual', durationSec = 6) => {
    if (!rendererRef.current) return;
    const canvas = rendererRef.current.domElement;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(60);
      const mimeType = getSupportedMimeType();
      
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps high-quality 60 FPS
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        const meta = {
          duration: `${durationSec}s`,
          filename: `natya_3d_twin_${activePose.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.webm`,
          poseName: activePose.name,
          tradition: activePose.tradition,
          sizeMB: (blob.size / (1024 * 1024)).toFixed(2) + ' MB',
          fps: 60,
          mimeType
        };

        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(videoUrl);
        setRecordedVideoMeta(meta);
        setIsRecording(false);
        setRecordMode(null);
        setShowPreviewModal(true);

        if (recordIntervalRef.current) {
          clearInterval(recordIntervalRef.current);
          recordIntervalRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      setIsRecording(true);
      setRecordMode(mode);
      setRecordProgress(0);

      const startTime = Date.now();
      const updateTimer = () => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        const totalMins = String(Math.floor(durationSec / 60)).padStart(2, '0');
        const totalSecs = String(durationSec % 60).padStart(2, '0');
        setRecordTimerText(mode === 'manual' ? `${mins}:${secs}` : `${mins}:${secs} / ${totalMins}:${totalSecs}`);
      };
      updateTimer();
      recordIntervalRef.current = setInterval(updateTimer, 500);

      return recorder;
    } catch (err) {
      console.error('Failed to initialize 3D Canvas Video Recorder:', err);
      alert('Video recording is not supported in this browser environment.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    turntableRecordStateRef.current.active = false;
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (sequenceIntervalRef.current) {
      clearInterval(sequenceIntervalRef.current);
      sequenceIntervalRef.current = null;
      setIsPlayingSequence(false);
    }
  };

  // Automated 360° Turntable Video Generator
  const handleGenerateTurntableVideo = (durationSec = 6) => {
    if (isRecording) return;
    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.35, 3.8);
    }

    turntableRecordStateRef.current = {
      active: true,
      durationMs: durationSec * 1000,
      startTime: Date.now(),
      initialRotation: 0
    };

    startCanvasRecording('turntable', durationSec);
  };

  // Choreographed Multi-Pose Dance Routine Video Generator
  const handleRecordDanceSequence = () => {
    if (isRecording) return;
    const selectedSequence = [
      'Aramandi',
      'Natarajasana',
      'Muzhumandi',
      'Alidha',
      'Tribhanga',
      'ChakkarSpin'
    ];
    const durationPerPose = 2.5; // 2.5 seconds per stance
    const totalDurationSec = selectedSequence.length * durationPerPose;

    startCanvasRecording('sequence', totalDurationSec);

    let currentIndex = 0;
    switchPose(selectedSequence[0]);

    sequenceIntervalRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex < selectedSequence.length) {
        switchPose(selectedSequence[currentIndex]);
      } else {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = null;
        stopRecording();
      }
    }, durationPerPose * 1000);
  };

  // Sequence Playback (without recording)
  const togglePlaySequence = () => {
    if (isPlayingSequence) {
      if (sequenceIntervalRef.current) {
        clearInterval(sequenceIntervalRef.current);
        sequenceIntervalRef.current = null;
      }
      setIsPlayingSequence(false);
    } else {
      setIsPlayingSequence(true);
      const poseKeys = Object.keys(POSES_CONFIG);
      let currentIndex = poseKeys.indexOf(selectedPoseKey);
      if (currentIndex === -1) currentIndex = 0;

      sequenceIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % poseKeys.length;
        switchPose(poseKeys[currentIndex]);
      }, 3000);
    }
  };

  // =========================================================================
  // 2. MOCAP DATASET JSON IMPORT & EXPORT HANDLERS
  // =========================================================================

  const handleExportMoCap = () => {
    const active = activePose;
    const data = {
      model_title: 'NATYA AI 3D Classical Dance Spatial MoCap Dataset',
      pose_key: selectedPoseKey,
      pose_name: active.name,
      dance_tradition: active.tradition,
      region_origin: active.region || 'India',
      primary_mudras: active.mudra,
      difficulty_tier: active.difficulty,
      ideal_biomechanical_angles: active.ideal_angles,
      joints_count: active.joints.length,
      timestamp: new Date().toISOString(),
      spatial_coordinates_3d: active.joints.map((j, i) => {
        const labels = [
          'Pelvis Root', 'Spine Mid', 'Neck Base', 'Cranial Head',
          'Left Shoulder', 'Left Elbow', 'Left Wrist / Mudra',
          'Right Shoulder', 'Right Elbow', 'Right Wrist / Mudra',
          'Left Hip Joint', 'Left Knee', 'Left Ankle',
          'Right Hip Joint', 'Right Knee', 'Right Ankle'
        ];
        return {
          joint_index: i,
          joint_name: labels[i] || `Joint_${i}`,
          x: Number(j.x.toFixed(4)),
          y: Number(j.y.toFixed(4)),
          z: Number(j.z.toFixed(4))
        };
      })
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `natya_3d_mocap_${selectedPoseKey.toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3500);
  };

  // Import / Upload MoCap JSON File and Morph 3D Twin
  const handleImportMoCapJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        let importedJoints = [];

        if (Array.isArray(parsed.spatial_coordinates_3d)) {
          importedJoints = parsed.spatial_coordinates_3d.map(c => new THREE.Vector3(Number(c.x), Number(c.y), Number(c.z)));
        } else if (Array.isArray(parsed.joints)) {
          importedJoints = parsed.joints.map(j => {
            if (Array.isArray(j)) return new THREE.Vector3(Number(j[0]), Number(j[1]), Number(j[2]));
            return new THREE.Vector3(Number(j.x || 0), Number(j.y || 0), Number(j.z || 0));
          });
        }

        if (importedJoints.length < 16) {
          throw new Error('JSON file must contain at least 16 3D joint coordinate points.');
        }

        const customModel = {
          name: parsed.pose_name || parsed.model_title || file.name.replace('.json', ''),
          tradition: parsed.dance_tradition || 'Custom Tradition',
          region: parsed.region_origin || 'Imported File',
          mudra: parsed.primary_mudras || 'Custom Mudras',
          difficulty: parsed.difficulty_tier || 'Custom MoCap',
          description: `Imported from ${file.name} with ${importedJoints.length} spatial 3D keypoints.`,
          ideal_angles: parsed.ideal_biomechanical_angles || {
            leftKnee: 120,
            rightKnee: 120,
            leftElbow: 140,
            rightElbow: 140,
            spinePitch: 90
          },
          tips: ['Custom MoCap posture loaded directly into WebGL 3D Twin engine.', 'Click "Export 360° Video" to generate video for this imported JSON!'],
          joints: importedJoints
        };

        setCustomPose(customModel);
        setSelectedPoseKey('Custom');
        targetJointPositionsRef.current = importedJoints.map(j => j.clone());

        setUploadFeedback({
          type: 'success',
          msg: `Successfully imported "${customModel.name}" with 16 3D joints!`
        });
        setTimeout(() => setUploadFeedback(null), 5000);
      } catch (err) {
        console.error('JSON import error:', err);
        setUploadFeedback({
          type: 'error',
          msg: `Failed to parse JSON file: ${err.message}`
        });
        setTimeout(() => setUploadFeedback(null), 5000);
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // Download Recorded Video directly
  const handleDownloadVideo = () => {
    if (!recordedVideoBlob || !recordedVideoMeta) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = recordedVideoMeta.filename;
    a.click();
  };

  // Filtered Postures List
  const filteredPoses = Object.entries(POSES_CONFIG).filter(([key, pose]) => {
    const matchesTradition = selectedTradition === 'All' || pose.tradition === selectedTradition;
    const matchesSearch = searchQuery === '' || 
      pose.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pose.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pose.tradition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTradition && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Hidden File Input for JSON MoCap Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json,application/json" 
        onChange={handleImportMoCapJSON} 
      />

      {/* Top Header Banner with Action Buttons */}
      <div 
        className="temple-panel" 
        style={{ 
          padding: '2.25rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem', 
          borderRadius: 'var(--radius-lg)' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold"><Sparkles size={13} /> WebGL 3D Spatial Twin</span>
            <span className="badge badge-peacock"><Video size={13} /> 60 FPS Video Exporter</span>
            <span className="badge badge-emerald"><FileJson size={13} /> MoCap JSON I/O</span>
            <span className="badge badge-maroon"><Activity size={13} /> 360° Turntable Engine</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            3D Twin & Motion Capture Video Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.4rem', maxWidth: '780px' }}>
            Interactive 3D Digital Twin with 360° rotational inspection, real-time biomechanical telemetry, 60 FPS video recording, and bidirectional MoCap JSON import/export.
          </p>
        </div>

        {/* Header Action Suite: Video & JSON Export Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* 1. Generate 360° Turntable Video Button */}
          <button 
            onClick={() => handleGenerateTurntableVideo(6)}
            disabled={isRecording}
            className="btn-primary" 
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: isRecording ? 'rgba(100, 116, 139, 0.4)' : 'var(--grad-gold)'
            }}
          >
            <Video size={18} />
            <span>{isRecording && recordMode === 'turntable' ? 'Rendering 360° Video...' : 'Export 360° Video (.WebM)'}</span>
          </button>

          {/* 2. Import MoCap JSON Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary" 
            style={{ 
              padding: '12px 18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              color: 'var(--cyan-light)'
            }}
            title="Upload a .json MoCap dataset to load and render as 3D video"
          >
            <Upload size={17} />
            <span>Import MoCap (.JSON)</span>
          </button>

          {/* 3. Export Raw JSON Button */}
          <button 
            onClick={handleExportMoCap} 
            className="btn-secondary" 
            style={{ 
              padding: '12px 18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <FileJson size={17} />
            <span>Export JSON</span>
          </button>

        </div>
      </div>

      {/* Upload Feedback Banner */}
      {uploadFeedback && (
        <div 
          style={{ 
            padding: '0.85rem 1.25rem', 
            borderRadius: 'var(--radius-sm)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            fontSize: '0.9rem',
            background: uploadFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: uploadFeedback.type === 'success' ? '#34d399' : '#f87171',
            border: `1px solid ${uploadFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
          }}
        >
          {uploadFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{uploadFeedback.msg}</span>
        </div>
      )}

      {/* Main 3D Viewport & Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '2rem' }}>
        
        {/* Three.js 3D Viewport Column */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--gold-primary)' }}>
          
          {/* Viewport Canvas Container */}
          <div style={{ position: 'relative' }}>
            <div 
              ref={mountRef} 
              style={{ 
                width: '100%', 
                height: '520px', 
                borderRadius: 'var(--radius-sm)', 
                overflow: 'hidden', 
                background: '#0f172a', 
                border: isRecording ? '2px solid #ef4444' : '1px solid var(--border-card)', 
                cursor: 'grab',
                boxShadow: isRecording ? '0 0 25px rgba(239, 68, 68, 0.4)' : 'var(--shadow-sm)',
                transition: 'border 0.3s ease'
              }}
            />
            
            {/* Top Left: Overlay instruction or Recording HUD */}
            {isRecording ? (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '14px', 
                  left: '14px', 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1.5px solid #ef4444', 
                  fontSize: '0.84rem', 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)', 
                  backdropFilter: 'blur(8px)',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span>
                  REC {recordTimerText} • {recordMode === 'turntable' ? '360° Turntable Video' : recordMode === 'sequence' ? 'Choreographed Routine' : 'Live Capture'}
                </span>
                {recordMode === 'turntable' && (
                  <span style={{ color: 'var(--gold-light)', marginLeft: '4px' }}>({recordProgress}%)</span>
                )}
                <button
                  onClick={stopRecording}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    marginLeft: '8px'
                  }}
                >
                  Stop
                </button>
              </div>
            ) : (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '14px', 
                  left: '14px', 
                  background: 'rgba(15, 23, 42, 0.9)', 
                  padding: '6px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  fontSize: '0.8rem', 
                  color: '#f8fafc', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  boxShadow: 'var(--shadow-md)', 
                  backdropFilter: 'blur(8px)' 
                }}
              >
                <Move3d size={15} color="var(--gold-primary)" /> Click & drag to rotate 360° • Scroll to zoom
              </div>
            )}

            {/* Quick Floating Zoom & Reset Dock */}
            <div style={{ position: 'absolute', bottom: '14px', right: '14px', display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)' }}>
              <button 
                onClick={() => handleZoom('in')} 
                title="Zoom In"
                style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '6px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={() => handleZoom('out')} 
                title="Zoom Out"
                style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '6px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={handleResetCamera} 
                title="Reset Viewpoint"
                style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', padding: '6px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
              >
                <Compass size={16} />
              </button>
            </div>

            {/* Active Model Name Badge Overlay */}
            <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(15, 23, 42, 0.9)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-primary)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                {activePose.tradition} • {activePose.difficulty}
              </div>
              <div style={{ fontSize: '0.98rem', color: '#fff', fontWeight: 800 }}>
                {activePose.name}
              </div>
            </div>
          </div>

          {/* Viewport Toolbar Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
            
            {/* Auto-Rotation Speed Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Orbit:</span>
              {[
                { label: 'Off', val: 0 },
                { label: '1x', val: 1 },
                { label: '2x', val: 2 }
              ].map(speed => (
                <button
                  key={speed.label}
                  onClick={() => setOrbitSpeed(speed.val)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: orbitSpeed === speed.val ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    background: orbitSpeed === speed.val ? 'var(--gold-bg)' : '#f8fafc',
                    color: orbitSpeed === speed.val ? 'var(--gold-dark)' : 'var(--text-secondary)'
                  }}
                >
                  {speed.label}
                </button>
              ))}
            </div>

            {/* Sequence Player Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={togglePlaySequence}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isPlayingSequence ? '1.5px solid var(--emerald-primary)' : '1px solid var(--border-subtle)',
                  background: isPlayingSequence ? 'var(--emerald-bg)' : '#f8fafc',
                  color: isPlayingSequence ? 'var(--emerald-primary)' : 'var(--text-secondary)'
                }}
              >
                {isPlayingSequence ? <Square size={13} /> : <Play size={13} />}
                <span>{isPlayingSequence ? 'Stop Routine' : 'Play Routine'}</span>
              </button>
            </div>

            {/* Hologram Theme Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={15} color="var(--gold-primary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Theme:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Object.entries(THEMES).map(([tKey, tObj]) => (
                  <button
                    key={tKey}
                    onClick={() => setCurrentTheme(tKey)}
                    title={tObj.name}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: currentTheme === tKey ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: currentTheme === tKey ? 'var(--gold-bg)' : '#f8fafc',
                      color: currentTheme === tKey ? 'var(--gold-dark)' : 'var(--text-muted)'
                    }}
                  >
                    {tObj.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Video Recording Action Suite */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            
            {/* Action 1: 360 Spin Video */}
            <button
              onClick={() => handleGenerateTurntableVideo(6)}
              disabled={isRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gold-bg)',
                border: '1px solid #fde68a',
                color: 'var(--gold-dark)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: isRecording ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCw size={15} />
              <span>Record 360° Turntable</span>
            </button>

            {/* Action 2: Dance Routine Video */}
            <button
              onClick={handleRecordDanceSequence}
              disabled={isRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--cyan-bg)',
                border: '1px solid #bae6fd',
                color: 'var(--cyan-primary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: isRecording ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Film size={15} />
              <span>Record Dance Routine</span>
            </button>

            {/* Action 3: Manual Interactive Recording */}
            <button
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  startCanvasRecording('manual', 30);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isRecording && recordMode === 'manual' ? 'var(--rose-bg)' : 'var(--emerald-bg)',
                border: isRecording && recordMode === 'manual' ? '1px solid #fecaca' : '1px solid #a7f3d0',
                color: isRecording && recordMode === 'manual' ? 'var(--rose-primary)' : 'var(--emerald-primary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isRecording && recordMode === 'manual' ? <Square size={15} /> : <Video size={15} />}
              <span>{isRecording && recordMode === 'manual' ? 'Stop & Save Video' : 'Start Live Record'}</span>
            </button>

          </div>

          {/* Export Success Notification */}
          {exportedSuccess && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--emerald-bg)', color: 'var(--emerald-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <CheckCircle size={16} /> 3D MoCap dataset for "{activePose.name}" exported successfully!
            </div>
          )}

          {/* Biomechanical Telemetry Dashboard Card */}
          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '6px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="var(--gold-primary)" />
                Biomechanical 3D Joint Angles & Approximations
              </h4>
              <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                Approx. Values (±3°–5°)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Left Knee Degree</div>
                <div style={{ color: 'var(--gold-dark)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.leftKnee || 120}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Right Knee Degree</div>
                <div style={{ color: 'var(--gold-dark)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.rightKnee || 120}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Left Shoulder Degree</div>
                <div style={{ color: 'var(--cyan-primary)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.leftShoulder || 85}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Right Shoulder Degree</div>
                <div style={{ color: 'var(--cyan-primary)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.rightShoulder || 85}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Left Wrist Degree</div>
                <div style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.leftWrist || 170}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Right Wrist Degree</div>
                <div style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.rightWrist || 170}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Left Elbow Arc</div>
                <div style={{ color: 'var(--cyan-primary)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.leftElbow || 140}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Right Elbow Arc</div>
                <div style={{ color: 'var(--cyan-primary)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.rightElbow || 140}°</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Spinal Axis</div>
                <div style={{ color: 'var(--emerald-primary)', fontWeight: 800, fontSize: '1.05rem' }}>~{activePose.ideal_angles?.spinePitch || 90}° Vert</div>
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
              * All 3D canonical joint degree values are pedagogical kinematic approximations calibrated to classical Natyashastra standard.
            </div>
          </div>

        </div>

        {/* 3D Model Selection & Educational Details Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Posture Switcher & Filters */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--cyan-primary)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <Layers size={19} color="var(--cyan-primary)" />
                3D Posture Model Library ({filteredPoses.length + (customPose ? 1 : 0)})
              </h3>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search postures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Tradition Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TRADITION_FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedTradition(filter)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedTradition === filter ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
                    background: selectedTradition === filter ? 'var(--cyan-bg)' : '#ffffff',
                    color: selectedTradition === filter ? 'var(--cyan-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Posture Models Scrollable Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* Custom Uploaded Pose Card (if loaded) */}
              {customPose && (
                <button
                  onClick={() => switchPose('Custom')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedPoseKey === 'Custom' ? '1.5px solid var(--emerald-primary)' : '1px solid var(--border-subtle)',
                    background: selectedPoseKey === 'Custom' ? 'var(--emerald-bg)' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.94rem', color: selectedPoseKey === 'Custom' ? 'var(--emerald-primary)' : 'var(--text-primary)' }}>
                        ★ {customPose.name} (Custom MoCap)
                      </strong>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        Imported JSON
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {customPose.description}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--emerald-primary)', fontWeight: 700 }}>
                      Custom 3D
                    </span>
                    {selectedPoseKey === 'Custom' && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 800 }}>
                        ● ACTIVE 3D
                      </span>
                    )}
                  </div>
                </button>
              )}

              {filteredPoses.map(([key, pose]) => {
                const isSelected = selectedPoseKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchPose(key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--gold-bg)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.94rem', color: isSelected ? 'var(--gold-dark)' : 'var(--text-primary)' }}>
                          {pose.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                          {pose.tradition}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {pose.description}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                        {pose.mudra.split('&')[0]}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 800 }}>
                          ● ACTIVE 3D
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredPoses.length === 0 && !customPose && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No 3D posture models match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Pedagogical Teaching Cues & Natyashastra Guidelines */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--gold-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--gold-primary)" />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                Natyashastra Pedagogical Teaching Cues
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activePose.tips?.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span><strong>Region:</strong> {activePose.region || 'India'}</span>
              <span><strong>Key Mudra:</strong> {activePose.mudra || 'Hasta'}</span>
              <span><strong>Level:</strong> {activePose.difficulty || 'All Levels'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          3. RECORDED VIDEO PREVIEW & EXPORT MODAL
          ========================================================================= */}
      {showPreviewModal && recordedVideoUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            className="glass-panel"
            style={{
              maxWidth: '680px',
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '2px solid var(--gold-primary)',
              background: '#ffffff',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative'
            }}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-gold"><Video size={13} /> 3D Twin Video Ready</span>
                <span className="badge badge-emerald">60 FPS Render</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
                {recordedVideoMeta?.poseName} - 3D Video
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Your 3D Digital Twin video animation has been recorded. Download the video or accompanying MoCap JSON below.
              </p>
            </div>

            {/* Embedded Video Player */}
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000', maxHeight: '340px' }}>
              <video 
                src={recordedVideoUrl} 
                controls 
                autoPlay 
                loop 
                style={{ width: '100%', height: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block' }} 
              />
            </div>

            {/* Video Metadata Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Format</span>
                <span style={{ color: 'var(--gold-dark)', fontWeight: 800 }}>WebM Video (60fps)</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Duration</span>
                <span style={{ color: 'var(--cyan-primary)', fontWeight: 800 }}>{recordedVideoMeta?.duration}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>File Size</span>
                <span style={{ color: 'var(--emerald-primary)', fontWeight: 800 }}>{recordedVideoMeta?.sizeMB}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tradition</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{recordedVideoMeta?.tradition}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              
              {/* Primary Video Download */}
              <button
                onClick={handleDownloadVideo}
                className="btn-primary"
                style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={18} />
                <span>Download 3D Video (.WebM)</span>
              </button>

              {/* Accompanying JSON Download */}
              <button
                onClick={handleExportMoCap}
                className="btn-secondary"
                style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FileJson size={18} />
                <span>Download MoCap JSON</span>
              </button>

              {/* Record Another */}
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleGenerateTurntableVideo(6);
                }}
                className="btn-secondary"
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                title="Record Another Video"
              >
                <RefreshCw size={16} />
                <span>Re-Record</span>
              </button>

            </div>

          </div>
        </div>
      )}


    </div>
  );
}
