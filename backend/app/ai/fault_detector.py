"""
Fault Detector Engine for Natya AI Dance Style Classification
Detects non-dance images, non-human subjects, obscured poses, and casual postures
to prevent closed-set softmax neural network hallucinations.
"""

from typing import Dict, Any, Optional
import numpy as np

def evaluate_dance_image_fault(
    raw_landmarks,
    sig: Dict[str, Any],
    image_shape: tuple = (480, 640, 3)
) -> Dict[str, Any]:
    """
    Evaluates an input image across 4 validation gates:
    1. Human subject presence (MediaPipe landmarks)
    2. Anatomical completeness (core torso and limbs visible)
    3. Classical dance biomechanics vs everyday casual posture
    4. Classical costume & aesthetic markers

    Returns a structured fault report.
    """
    diagnostics = {
        "human_detected": False,
        "body_complete": False,
        "classical_kinematics": False,
        "kinematics_score": 0.0,
        "costume_detected": False,
        "detected_markers": []
    }

    # -------------------------------------------------------------
    # GATE 1: HUMAN PRESENCE CHECK
    # -------------------------------------------------------------
    if raw_landmarks is None or len(raw_landmarks) == 0:
        return {
            "fault_detected": True,
            "fault_code": "NO_HUMAN_DETECTED",
            "fault_title": "No Human Dancer Detected",
            "fault_message": "The uploaded image does not contain a recognizable human dancer. The AI could not identify any skeletal body landmarks.",
            "fault_guidance": "Please upload a clear image of a person performing an Indian classical dance form (Bharatanatyam, Kathak, Kathakali, Kuchipudi, or Mohiniyattam).",
            "diagnostics": diagnostics
        }

    diagnostics["human_detected"] = True

    # -------------------------------------------------------------
    # GATE 2: BODY COMPLETENESS & VISIBILITY CHECK
    # -------------------------------------------------------------
    # Landmark indices
    # 11: left_shoulder, 12: right_shoulder, 23: left_hip, 24: right_hip
    try:
        ls = raw_landmarks[11]
        rs = raw_landmarks[12]
        lh = raw_landmarks[23]
        rh = raw_landmarks[24]
        
        ls_vis = float(getattr(ls, 'visibility', 0.9))
        rs_vis = float(getattr(rs, 'visibility', 0.9))
        lh_vis = float(getattr(lh, 'visibility', 0.9))
        rh_vis = float(getattr(rh, 'visibility', 0.9))

        # Check if both shoulders have acceptable visibility
        shoulders_visible = (ls_vis > 0.35 and rs_vis > 0.35)
        # Check if at least one hip is visible (upper body or full body)
        torso_visible = (lh_vis > 0.25 or rh_vis > 0.25)

        if not shoulders_visible and not torso_visible:
            return {
                "fault_detected": True,
                "fault_code": "INCOMPLETE_BODY_POSE",
                "fault_title": "Obscured or Cropped Subject",
                "fault_message": "The dancer's upper body / torso is heavily obscured, cropped, or out of frame. Classical dance classification requires a visible posture.",
                "fault_guidance": "Ensure the dancer's shoulders, arms, and torso are clearly visible within the frame.",
                "diagnostics": diagnostics
            }
        
        diagnostics["body_complete"] = True
    except (IndexError, AttributeError):
        return {
            "fault_detected": True,
            "fault_code": "INCOMPLETE_BODY_POSE",
            "fault_title": "Incomplete Skeletal Landmark Data",
            "fault_message": "Insufficient skeletal keypoints detected to evaluate dance posture.",
            "fault_guidance": "Please upload an image where the dancer is centered and clearly visible.",
            "diagnostics": diagnostics
        }

    # -------------------------------------------------------------
    # GATE 3: COSTUME & TRADITION MARKERS CHECK
    # -------------------------------------------------------------
    has_costume = (
        sig.get("is_kathakali", False) or 
        sig.get("is_mohiniyattam", False) or 
        sig.get("is_bharatanatyam", False) or 
        sig.get("is_kathak", False)
    )
    diagnostics["costume_detected"] = bool(has_costume)
    if sig.get("is_kathakali"):
        diagnostics["detected_markers"].append("Kathakali Paccha/Vesham Makeup")
    if sig.get("is_mohiniyattam"):
        diagnostics["detected_markers"].append("Mohiniyattam Kasavu Gold/Cream Attire")
    if sig.get("is_bharatanatyam"):
        diagnostics["detected_markers"].append("Bharatanatyam Silk & Pleat Tones")
    if sig.get("is_kathak"):
        diagnostics["detected_markers"].append("Kathak Flared Silhouette")

    # -------------------------------------------------------------
    # GATE 4: CLASSICAL KINEMATICS VS CASUAL EVERYDAY POSTURE
    # -------------------------------------------------------------
    from app.ai.pose_detector import calculate_angle

    def get_pt(idx):
        return [float(raw_landmarks[idx].x), float(raw_landmarks[idx].y)]

    try:
        left_shoulder_angle = calculate_angle(get_pt(23), get_pt(11), get_pt(13))
        right_shoulder_angle = calculate_angle(get_pt(24), get_pt(12), get_pt(14))
        left_elbow_angle = calculate_angle(get_pt(11), get_pt(13), get_pt(15))
        right_elbow_angle = calculate_angle(get_pt(12), get_pt(14), get_pt(16))
        left_knee_angle = calculate_angle(get_pt(23), get_pt(25), get_pt(27))
        right_knee_angle = calculate_angle(get_pt(24), get_pt(26), get_pt(28))
    except Exception:
        left_shoulder_angle = 20.0
        right_shoulder_angle = 20.0
        left_elbow_angle = 170.0
        right_elbow_angle = 170.0
        left_knee_angle = 175.0
        right_knee_angle = 175.0

    # Indicators of Classical Dance Kinematics:
    # 1. Arm abduction / Natyarambha framing: arms lifted outward (> 42°)
    arm_framed = (left_shoulder_angle > 42.0 or right_shoulder_angle > 42.0)
    # 2. Elbow flexion / Mudra presentation (bent elbows 65° - 155°)
    elbow_framed = (65.0 <= left_elbow_angle <= 155.0 or 65.0 <= right_elbow_angle <= 155.0)
    # 3. Knee flexion: Aramandi, Ayatam, or Thoppi squat (knee angle <= 155°)
    knee_flexed = (left_knee_angle <= 155.0 or right_knee_angle <= 155.0)
    # 4. Asymmetric dance poise (one arm raised high > 70°, or one leg lifted)
    asymmetric_poise = (abs(left_shoulder_angle - right_shoulder_angle) > 30.0 or abs(left_knee_angle - right_knee_angle) > 25.0)

    # Compute a normalized dance kinematic score (0 - 100)
    kinematic_score = 0.0
    if arm_framed:
        kinematic_score += 35.0
    if elbow_framed:
        kinematic_score += 25.0
    if knee_flexed:
        kinematic_score += 30.0
    if asymmetric_poise:
        kinematic_score += 10.0

    diagnostics["kinematics_score"] = round(kinematic_score, 1)

    # Indicators of Casual / Everyday Stance:
    # Arms resting straight down at sides (< 38° abduction) and legs locked straight (> 162°)
    is_casual_standing = (
        left_shoulder_angle < 38.0 and 
        right_shoulder_angle < 38.0 and 
        left_knee_angle > 162.0 and 
        right_knee_angle > 162.0
    )

    # Overall non-dance posture check:
    # If kinematic score is very low (< 25%) AND no classical costume detected:
    is_non_dance_posture = (kinematic_score < 25.0 and not has_costume) or (is_casual_standing and not has_costume)

    if is_non_dance_posture:
        diagnostics["classical_kinematics"] = False
        return {
            "fault_detected": True,
            "fault_code": "NON_DANCE_POSTURE",
            "fault_title": "Non-Dance Posture Detected",
            "fault_message": "The person in this image is in a casual or non-dance posture (arms resting at sides or everyday stance) without classical dance attire.",
            "fault_guidance": "To perform classical dance classification, strike a canonical posture such as Natyarambha (arms extended horizontally at shoulder height) or Aramandi (diamond half-squat with bent knees).",
            "diagnostics": diagnostics
        }

    diagnostics["classical_kinematics"] = True

    # All gates passed
    return {
        "fault_detected": False,
        "fault_code": "NONE",
        "fault_title": "Valid Classical Dance Posture",
        "fault_message": "Valid classical dance geometry and presentation verified.",
        "fault_guidance": "",
        "diagnostics": diagnostics
    }
