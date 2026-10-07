import os
import cv2
import numpy as np
import mediapipe as mp
from app.config import MODELS_DIR
from app.ai.ema_filter import EMAFilter, JointAnglesEMAFilter, LandmarkEMAFilter

TASK_MODEL_PATH = os.path.join(MODELS_DIR, "pose_landmarker_full.task")

# Landmark Indices Mapping (Standard 33 MediaPipe Points)
LANDMARK_INDICES = {
    "NOSE": 0,
    "LEFT_EYE_INNER": 1, "LEFT_EYE": 2, "LEFT_EYE_OUTER": 3,
    "RIGHT_EYE_INNER": 4, "RIGHT_EYE": 5, "RIGHT_EYE_OUTER": 6,
    "LEFT_EAR": 7, "RIGHT_EAR": 8,
    "MOUTH_LEFT": 9, "MOUTH_RIGHT": 10,
    "LEFT_SHOULDER": 11, "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13, "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15, "RIGHT_WRIST": 16,
    "LEFT_PINKY": 17, "RIGHT_PINKY": 18,
    "LEFT_INDEX": 19, "RIGHT_INDEX": 20,
    "LEFT_THUMB": 21, "RIGHT_THUMB": 22,
    "LEFT_HIP": 23, "RIGHT_HIP": 24,
    "LEFT_KNEE": 25, "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27, "RIGHT_ANKLE": 28,
    "LEFT_HEEL": 29, "RIGHT_HEEL": 30,
    "LEFT_FOOT_INDEX": 31, "RIGHT_FOOT_INDEX": 32
}

# Standard Skeletal Connections for Classical Dance
POSE_CONNECTIONS = [
    (11, 12), # Left Shoulder - Right Shoulder
    (11, 13), (13, 15), # Left Arm
    (12, 14), (14, 16), # Right Arm
    (11, 23), (12, 24), # Torso sides
    (23, 24), # Hips
    (23, 25), (25, 27), (27, 29), (29, 31), # Left Leg
    (24, 26), (26, 28), (28, 30), (30, 32), # Right Leg
    (0, 11), (0, 12) # Head/Neck
]

# Initialize MediaPipe Tasks Landmarker
_landmarker = None

def get_landmarker():
    """Initializes or returns singleton MediaPipe PoseLandmarker."""
    global _landmarker
    if _landmarker is None and os.path.exists(TASK_MODEL_PATH):
        try:
            from mediapipe.tasks.python import vision
            from mediapipe.tasks.python.core import base_options
            
            options = vision.PoseLandmarkerOptions(
                base_options=base_options.BaseOptions(model_asset_path=TASK_MODEL_PATH),
                running_mode=vision.RunningMode.IMAGE,
                num_poses=1,
                min_pose_detection_confidence=0.5,
                min_pose_presence_confidence=0.5,
                min_tracking_confidence=0.5
            )
            _landmarker = vision.PoseLandmarker.create_from_options(options)
            print("MediaPipe PoseLandmarker initialized successfully.")
        except Exception as e:
            print(f"PoseLandmarker initialization note: {e}")
    return _landmarker


def calculate_angle(a, b, c) -> float:
    """
    Calculates the 2D joint angle between three points a, b (vertex), c.
    Returns angle in degrees (0 - 180).
    """
    a = np.array(a[:2], dtype=np.float32)
    b = np.array(b[:2], dtype=np.float32)
    c = np.array(c[:2], dtype=np.float32)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360.0 - angle
        
    return round(float(angle), 2)


def process_image_pose(image_np):
    """
    Runs pose detection on an OpenCV RGB/BGR image and extracts raw landmarks.
    """
    landmarker = get_landmarker()
    if landmarker is None:
        return None
        
    rgb_image = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB) if len(image_np.shape) == 3 and image_np.shape[2] == 3 else image_np
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
    
    detection_result = landmarker.detect(mp_image)
    if not detection_result or not detection_result.pose_landmarks:
        return None
        
    return detection_result.pose_landmarks[0] # First detected person


def extract_landmarks(raw_landmarks, image_shape=None):
    """
    Converts raw MediaPipe landmarks into dictionary and flat 99-feature vector.
    """
    if raw_landmarks is None:
        return None
        
    h, w = (image_shape[:2]) if image_shape is not None else (1, 1)
    
    def pt(idx):
        if idx < len(raw_landmarks):
            lm = raw_landmarks[idx]
            return {
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(getattr(lm, 'z', 0.0)),
                "visibility": float(getattr(lm, 'visibility', 0.9)),
                "px": int(lm.x * w),
                "py": int(lm.y * h)
            }
        return {"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.0, "px": int(0.5 * w), "py": int(0.5 * h)}
        
    landmarks_dict = {
        "nose": pt(LANDMARK_INDICES["NOSE"]),
        "left_shoulder": pt(LANDMARK_INDICES["LEFT_SHOULDER"]),
        "right_shoulder": pt(LANDMARK_INDICES["RIGHT_SHOULDER"]),
        "left_elbow": pt(LANDMARK_INDICES["LEFT_ELBOW"]),
        "right_elbow": pt(LANDMARK_INDICES["RIGHT_ELBOW"]),
        "left_wrist": pt(LANDMARK_INDICES["LEFT_WRIST"]),
        "right_wrist": pt(LANDMARK_INDICES["RIGHT_WRIST"]),
        "left_pinky": pt(LANDMARK_INDICES["LEFT_PINKY"]),
        "right_pinky": pt(LANDMARK_INDICES["RIGHT_PINKY"]),
        "left_index": pt(LANDMARK_INDICES["LEFT_INDEX"]),
        "right_index": pt(LANDMARK_INDICES["RIGHT_INDEX"]),
        "left_thumb": pt(LANDMARK_INDICES["LEFT_THUMB"]),
        "right_thumb": pt(LANDMARK_INDICES["RIGHT_THUMB"]),
        "left_hip": pt(LANDMARK_INDICES["LEFT_HIP"]),
        "right_hip": pt(LANDMARK_INDICES["RIGHT_HIP"]),
        "left_knee": pt(LANDMARK_INDICES["LEFT_KNEE"]),
        "right_knee": pt(LANDMARK_INDICES["RIGHT_KNEE"]),
        "left_ankle": pt(LANDMARK_INDICES["LEFT_ANKLE"]),
        "right_ankle": pt(LANDMARK_INDICES["RIGHT_ANKLE"]),
        "left_heel": pt(LANDMARK_INDICES["LEFT_HEEL"]),
        "right_heel": pt(LANDMARK_INDICES["RIGHT_HEEL"]),
        "left_foot_index": pt(LANDMARK_INDICES["LEFT_FOOT_INDEX"]),
        "right_foot_index": pt(LANDMARK_INDICES["RIGHT_FOOT_INDEX"])
    }
    
    flat_features = []
    for lm in raw_landmarks:
        flat_features.extend([float(lm.x), float(lm.y), float(getattr(lm, 'z', 0.0))])
        
    return {
        "dict": landmarks_dict,
        "flat": flat_features,
        "raw": raw_landmarks
    }


def draw_classical_skeleton(image, raw_landmarks):
    """
    Draws custom high-contrast gold & emerald classical dance skeleton onto image.
    """
    annotated = image.copy()
    if raw_landmarks is None:
        return annotated
        
    h, w, _ = image.shape
    
    # Draw bone connections
    for start_idx, end_idx in POSE_CONNECTIONS:
        if start_idx < len(raw_landmarks) and end_idx < len(raw_landmarks):
            pt1 = (int(raw_landmarks[start_idx].x * w), int(raw_landmarks[start_idx].y * h))
            pt2 = (int(raw_landmarks[end_idx].x * w), int(raw_landmarks[end_idx].y * h))
            # Gold line
            cv2.line(annotated, pt1, pt2, (55, 175, 212), 3)
            
    # Draw joint landmarks
    for lm in raw_landmarks:
        px = int(lm.x * w)
        py = int(lm.y * h)
        # Outer ring
        cv2.circle(annotated, (px, py), 6, (230, 202, 101), -1)
        # Inner dot
        cv2.circle(annotated, (px, py), 3, (255, 255, 255), -1)
        
    return annotated
