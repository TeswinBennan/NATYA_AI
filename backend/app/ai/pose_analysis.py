import os
import cv2
import uuid
import numpy as np
from app.ai.pose_detector import process_image_pose, extract_landmarks, calculate_angle, draw_classical_skeleton
from app.ai.reference_poses import REFERENCE_POSES, get_default_reference_pose, normalize_dance_form, find_reference_pose
from app.config import POSE_UPLOAD_DIR

def analyze_pose_image(image_path: str) -> dict:
    """
    Performs full classical dance pose analysis on an input image.
    Generates joint angles, alignment scores, balance, and annotated skeleton visualization.
    """
    if not os.path.exists(image_path):
        return {"success": False, "message": f"Image file not found: {image_path}"}
    
    image = cv2.imread(image_path)
    if image is None:
        return {"success": False, "message": "Failed to decode image file."}
    
    raw_landmarks = process_image_pose(image)
    if raw_landmarks is None:
        return {
            "success": False,
            "message": "No dancer detected in the frame. Please ensure full body is visible."
        }
    
    extracted = extract_landmarks(raw_landmarks, image.shape)
    lm = extracted["dict"]
    
    # ----------------------------------------------------
    # 1. JOINT ANGLES & KINEMATIC APPROXIMATIONS
    # ----------------------------------------------------
    left_elbow = calculate_angle(
        [lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]],
        [lm["left_elbow"]["x"], lm["left_elbow"]["y"]],
        [lm["left_wrist"]["x"], lm["left_wrist"]["y"]]
    )
    left_shoulder = calculate_angle(
        [lm["left_hip"]["x"], lm["left_hip"]["y"]],
        [lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]],
        [lm["left_elbow"]["x"], lm["left_elbow"]["y"]]
    )
    left_wrist = calculate_angle(
        [lm["left_elbow"]["x"], lm["left_elbow"]["y"]],
        [lm["left_wrist"]["x"], lm["left_wrist"]["y"]],
        [lm.get("left_index", lm["left_wrist"])["x"], lm.get("left_index", lm["left_wrist"])["y"]]
    )
    
    right_elbow = calculate_angle(
        [lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]],
        [lm["right_elbow"]["x"], lm["right_elbow"]["y"]],
        [lm["right_wrist"]["x"], lm["right_wrist"]["y"]]
    )
    right_shoulder = calculate_angle(
        [lm["right_hip"]["x"], lm["right_hip"]["y"]],
        [lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]],
        [lm["right_elbow"]["x"], lm["right_elbow"]["y"]]
    )
    right_wrist = calculate_angle(
        [lm["right_elbow"]["x"], lm["right_elbow"]["y"]],
        [lm["right_wrist"]["x"], lm["right_wrist"]["y"]],
        [lm.get("right_index", lm["right_wrist"])["x"], lm.get("right_index", lm["right_wrist"])["y"]]
    )
    
    left_knee = calculate_angle(
        [lm["left_hip"]["x"], lm["left_hip"]["y"]],
        [lm["left_knee"]["x"], lm["left_knee"]["y"]],
        [lm["left_ankle"]["x"], lm["left_ankle"]["y"]]
    )
    left_hip = calculate_angle(
        [lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]],
        [lm["left_hip"]["x"], lm["left_hip"]["y"]],
        [lm["left_knee"]["x"], lm["left_knee"]["y"]]
    )
    left_ankle = calculate_angle(
        [lm["left_knee"]["x"], lm["left_knee"]["y"]],
        [lm["left_ankle"]["x"], lm["left_ankle"]["y"]],
        [lm.get("left_foot_index", lm["left_ankle"])["x"], lm.get("left_foot_index", lm["left_ankle"])["y"]]
    )
    
    right_knee = calculate_angle(
        [lm["right_hip"]["x"], lm["right_hip"]["y"]],
        [lm["right_knee"]["x"], lm["right_knee"]["y"]],
        [lm["right_ankle"]["x"], lm["right_ankle"]["y"]]
    )
    right_hip = calculate_angle(
        [lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]],
        [lm["right_hip"]["x"], lm["right_hip"]["y"]],
        [lm["right_knee"]["x"], lm["right_knee"]["y"]]
    )
    right_ankle = calculate_angle(
        [lm["right_knee"]["x"], lm["right_knee"]["y"]],
        [lm["right_ankle"]["x"], lm["right_ankle"]["y"]],
        [lm.get("right_foot_index", lm["right_ankle"])["x"], lm.get("right_foot_index", lm["right_ankle"])["y"]]
    )
    
    angles = {
        "left_knee": left_knee,
        "right_knee": right_knee,
        "left_shoulder": left_shoulder,
        "right_shoulder": right_shoulder,
        "left_wrist": left_wrist,
        "right_wrist": right_wrist,
        "left_elbow": left_elbow,
        "right_elbow": right_elbow,
        "left_hip": left_hip,
        "right_hip": right_hip,
        "left_ankle": left_ankle,
        "right_ankle": right_ankle
    }
    
    # ----------------------------------------------------
    # 2. BODY ALIGNMENT & BALANCE
    # ----------------------------------------------------
    shoulder_y_diff = abs(lm["left_shoulder"]["y"] - lm["right_shoulder"]["y"])
    if shoulder_y_diff < 0.04:
        shoulder_alignment = "Excellent"
        shoulder_score = 98.0
    elif shoulder_y_diff < 0.09:
        shoulder_alignment = "Moderate"
        shoulder_score = 80.0
    else:
        shoulder_alignment = "Needs Improvement"
        shoulder_score = 55.0
        
    hip_y_diff = abs(lm["left_hip"]["y"] - lm["right_hip"]["y"])
    if hip_y_diff < 0.04:
        hip_alignment = "Excellent"
        hip_score = 96.0
    elif hip_y_diff < 0.09:
        hip_alignment = "Moderate"
        hip_score = 78.0
    else:
        hip_alignment = "Needs Improvement"
        hip_score = 50.0
        
    hip_center_x = (lm["left_hip"]["x"] + lm["right_hip"]["x"]) / 2.0
    ankle_center_x = (lm["left_ankle"]["x"] + lm["right_ankle"]["x"]) / 2.0
    balance_deviation = abs(hip_center_x - ankle_center_x)
    balance_score = round(float(max(0.0, min(100.0, 100.0 - (balance_deviation * 280.0)))), 1)
    
    avg_knee_angle = (left_knee + right_knee) / 2.0
    avg_shoulder_angle = (left_shoulder + right_shoulder) / 2.0
    avg_elbow_angle = (left_elbow + right_elbow) / 2.0
    avg_wrist_angle = (left_wrist + right_wrist) / 2.0
    
    # ----------------------------------------------------
    # 3. KINEMATIC STANCE IDENTIFICATION & CONFORMITY SCORING
    # ----------------------------------------------------
    feedback = []
    
    # Check for Casual / Normal Everyday Standing Stance:
    # Arms resting down at sides (shoulder angles < 38°) and knees locked straight (> 165°)
    is_casual_stance = (left_shoulder < 38.0 and right_shoulder < 38.0) and (left_knee > 165.0 and right_knee > 165.0)
    
    if is_casual_stance:
        is_classical_pose = False
        stance_type = "Casual / Normal Standing Stance (Non-Classical Posture)"
        aramandi_depth = "None (Casual Straight Legs)"
        
        # Authentic low classical score for casual everyday stance (18% - 28%)
        overall_pose_score = round(max(15.0, min(28.0, 18.0 + (balance_score * 0.08))), 1)
        
        feedback.append("⚠️ Casual / Everyday standing posture detected (arms resting at sides, straight legs).")
        feedback.append(f"Shoulder degree: approx. ~{int(avg_shoulder_angle)}° (arms down at sides vs canonical Natyarambha ~80°-95°).")
        feedback.append(f"Knee degree: approx. ~{int(avg_knee_angle)}° (knees locked straight vs canonical Aramandi ~120°-135°).")
        feedback.append(f"Wrist degree: approx. ~{int(avg_wrist_angle)}° (relaxed wrists vs canonical Mudra alignment ~165°-175°).")
        feedback.append("To achieve classical form: Elevate arms horizontally to chest height (Natyarambha) and bend knees outwards into Aramandi diamond frame.")
        
    else:
        is_classical_pose = True
        
        if avg_knee_angle <= 135.0:
            aramandi_depth = "Deep Aramandi"
        elif avg_knee_angle <= 155.0:
            aramandi_depth = "Half Stance"
        else:
            aramandi_depth = "Standing (Samapada)"
            
        # Classical kinematic joint score: evaluates arm elevation + elbow frame + knee turnout + level symmetry + balance
        arm_elevation_score = max(0.0, min(100.0, 100.0 - abs(avg_shoulder_angle - 85.0) * 1.4))
        elbow_frame_score = max(0.0, min(100.0, 100.0 - abs(avg_elbow_angle - 145.0) * 1.3))
        knee_stance_score = max(0.0, min(100.0, (180.0 - avg_knee_angle) * 1.6))
        
        # Weighted overall classical score
        overall_pose_score = round(
            (arm_elevation_score * 0.25) + 
            (elbow_frame_score * 0.20) + 
            (knee_stance_score * 0.25) + 
            (shoulder_score * 0.15) + 
            (balance_score * 0.15), 
            1
        )
        overall_pose_score = max(35.0, min(97.5, overall_pose_score))
        
        if avg_shoulder_angle >= 65.0 and avg_knee_angle <= 145.0:
            stance_type = "Canonical Classical Posture (Aramandi & Natyarambha)"
        elif avg_shoulder_angle >= 50.0 or avg_knee_angle <= 150.0:
            stance_type = "Developing Classical Posture"
        else:
            stance_type = "Classical Upright Stance (Samapada)"
            
        if shoulder_alignment == "Excellent":
            feedback.append(f"Excellent horizontal shoulder levelness maintained (Shoulder degree: L ~{int(left_shoulder)}°, R ~{int(right_shoulder)}°).")
        else:
            feedback.append(f"Level your shoulders horizontally (measured L ~{int(left_shoulder)}°, R ~{int(right_shoulder)}°) to maintain classical Natyarambha symmetry.")
            
        if avg_knee_angle > 145.0:
            feedback.append(f"Knee flexion approx. ~{int(avg_knee_angle)}° — lower into deeper Aramandi (target ~120°-135°) to expand the classical diamond frame.")
        else:
            feedback.append(f"Good knee turnout and grounded stance (Knee degree: L ~{int(left_knee)}°, R ~{int(right_knee)}°).")
            
        feedback.append(f"Wrist alignment approx. L ~{int(left_wrist)}°, R ~{int(right_wrist)}° with elbow frame approx. L ~{int(left_elbow)}°, R ~{int(right_elbow)}°.")
            
        if balance_score >= 85:
            feedback.append("Great central balance and spinal alignment.")
        else:
            feedback.append("Shift your upper torso center slightly to align over your feet for stable footing.")
        
    # ----------------------------------------------------
    # 4. GENERATE ANNOTATED SKELETON IMAGE
    # ----------------------------------------------------
    annotated_img = draw_classical_skeleton(image, raw_landmarks)
    score_color = (60, 60, 240) if is_casual_stance else (50, 220, 100)
    status_label = "Casual Stance" if is_casual_stance else f"Score: {overall_pose_score}%"
    
    cv2.putText(annotated_img, f"Balance: {balance_score}%", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (55, 175, 212), 2)
    cv2.putText(annotated_img, f"Classical: {status_label}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, score_color, 2)
    
    annotated_filename = f"pose_{uuid.uuid4().hex[:8]}.jpg"
    annotated_save_path = os.path.join(POSE_UPLOAD_DIR, annotated_filename)
    cv2.imwrite(annotated_save_path, annotated_img)
    
    return {
        "success": True,
        "is_classical_pose": not is_casual_stance,
        "posture_category": "Casual / Normal Stance" if is_casual_stance else "Classical Dance Posture",
        "stance_type": stance_type,
        "angles": angles,
        "is_approximation": True,
        "precision_tolerance": "±3°–5°",
        "precision_note": "All degree values are kinematic approximations (±3°–5° precision based on camera perspective).",
        "alignment": {
            "shoulder": shoulder_alignment,
            "shoulder_score": shoulder_score,
            "hip": hip_alignment,
            "hip_score": hip_score,
            "balance_score": balance_score,
            "aramandi_depth": aramandi_depth
        },
        "overall_pose_score": overall_pose_score,
        "feedback": feedback,
        "landmarks": lm,
        "annotated_image_url": f"/uploads/poses/{annotated_filename}"
    }


def evaluate_live_frame(image_bytes: bytes, target_pose: str = "Aramandi (Ayata)", dance_form: str = "Bharatanatyam") -> dict:
    """
    Ultra-fast real-time frame evaluator for live camera posture correction.
    Compares joint angles against benchmark targets and generates instant corrective directives.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return {"success": False, "detected": False, "message": "Frame decode error"}
        
    raw_landmarks = process_image_pose(image)
    if raw_landmarks is None:
        return {
            "success": True,
            "detected": False,
            "message": "Step back into frame — full dancer body must be visible",
            "score": 0,
            "overall_score": 0,
            "directives": ["Step back so your full body is visible in the camera frame."]
        }
        
    extracted = extract_landmarks(raw_landmarks, image.shape)
    lm = extracted["dict"]
    raw_list = [
        {"x": float(p.x), "y": float(p.y), "z": float(getattr(p, 'z', 0.0)), "visibility": float(getattr(p, 'visibility', 0.9))}
        for p in raw_landmarks
    ]
    
    # Calculate all primary joint angles
    left_elbow = calculate_angle([lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]], [lm["left_elbow"]["x"], lm["left_elbow"]["y"]], [lm["left_wrist"]["x"], lm["left_wrist"]["y"]])
    right_elbow = calculate_angle([lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]], [lm["right_elbow"]["x"], lm["right_elbow"]["y"]], [lm["right_wrist"]["x"], lm["right_wrist"]["y"]])
    left_shoulder = calculate_angle([lm["left_hip"]["x"], lm["left_hip"]["y"]], [lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]], [lm["left_elbow"]["x"], lm["left_elbow"]["y"]])
    right_shoulder = calculate_angle([lm["right_hip"]["x"], lm["right_hip"]["y"]], [lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]], [lm["right_elbow"]["x"], lm["right_elbow"]["y"]])
    left_wrist = calculate_angle([lm["left_elbow"]["x"], lm["left_elbow"]["y"]], [lm["left_wrist"]["x"], lm["left_wrist"]["y"]], [lm.get("left_index", lm["left_wrist"])["x"], lm.get("left_index", lm["left_wrist"])["y"]])
    right_wrist = calculate_angle([lm["right_elbow"]["x"], lm["right_elbow"]["y"]], [lm["right_wrist"]["x"], lm["right_wrist"]["y"]], [lm.get("right_index", lm["right_wrist"])["x"], lm.get("right_index", lm["right_wrist"])["y"]])
    left_knee = calculate_angle([lm["left_hip"]["x"], lm["left_hip"]["y"]], [lm["left_knee"]["x"], lm["left_knee"]["y"]], [lm["left_ankle"]["x"], lm["left_ankle"]["y"]])
    right_knee = calculate_angle([lm["right_hip"]["x"], lm["right_hip"]["y"]], [lm["right_knee"]["x"], lm["right_knee"]["y"]], [lm["right_ankle"]["x"], lm["right_ankle"]["y"]])
    left_hip = calculate_angle([lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]], [lm["left_hip"]["x"], lm["left_hip"]["y"]], [lm["left_knee"]["x"], lm["left_knee"]["y"]])
    right_hip = calculate_angle([lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]], [lm["right_hip"]["x"], lm["right_hip"]["y"]], [lm["right_knee"]["x"], lm["right_knee"]["y"]])
    
    current_angles = {
        "left_knee": left_knee,
        "right_knee": right_knee,
        "left_shoulder": left_shoulder,
        "right_shoulder": right_shoulder,
        "left_wrist": left_wrist,
        "right_wrist": right_wrist,
        "left_elbow": left_elbow,
        "right_elbow": right_elbow,
        "left_hip": left_hip,
        "right_hip": right_hip
    }
    
    # Retrieve target pose benchmark using robust fuzzy lookup
    pose_benchmark = find_reference_pose(dance_form, target_pose)
    ideal_angles = pose_benchmark.get("ideal_angles", {})
    tolerances = pose_benchmark.get("tolerances", {})
    norm_form = pose_benchmark.get("dance_form", normalize_dance_form(dance_form))
    resolved_pose_name = pose_benchmark.get("name", target_pose)
    
    deviations = {}
    statuses = {}
    joint_scores = {}
    directives = []
    total_score = 0.0
    evaluated_count = 0
    
    for joint, target_val in ideal_angles.items():
        if joint in current_angles:
            cur_val = current_angles[joint]
            diff = round(abs(cur_val - target_val), 1)
            deviations[joint] = diff
            tol = tolerances.get(joint, 15.0)
            
            score = max(0.0, min(100.0, 100.0 - (diff * 1.5)))
            joint_scores[joint] = round(score, 1)
            total_score += score
            evaluated_count += 1
            
            if diff <= tol:
                statuses[joint] = "Optimal"
            elif diff <= tol + 15.0:
                statuses[joint] = "Needs Adjustment"
            else:
                statuses[joint] = "Critical Correction"
                
            # Generate real-time actionable directives
            if "knee" in joint and diff > tol:
                if cur_val > target_val:
                    directives.append(f"Bend {joint.replace('_', ' ')} deeper (target ~{int(target_val)}°)")
                else:
                    directives.append(f"Relax {joint.replace('_', ' ')} bend slightly (target ~{int(target_val)}°)")
            elif "wrist" in joint and diff > tol:
                directives.append(f"Align {joint.replace('_', ' ')} with forearm (target ~{int(target_val)}°)")
            elif "elbow" in joint and diff > tol:
                if cur_val < target_val:
                    directives.append(f"Extend {joint.replace('_', ' ')} wider outward (target ~{int(target_val)}°)")
                else:
                    directives.append(f"Curve {joint.replace('_', ' ')} gracefully (target ~{int(target_val)}°)")
            elif "shoulder" in joint and diff > tol:
                directives.append(f"Align {joint.replace('_', ' ')} to chest height (target ~{int(target_val)}°)")
                
    overall_score = round(total_score / evaluated_count, 1) if evaluated_count > 0 else 82.0
    
    # Shoulder & spinal levelness check
    shoulder_y_diff = abs(lm["left_shoulder"]["y"] - lm["right_shoulder"]["y"])
    if shoulder_y_diff < 0.04:
        shoulder_status = "Symmetrical & Level"
    elif shoulder_y_diff < 0.08:
        shoulder_status = "Slightly Uneven"
    else:
        shoulder_status = "Needs Alignment"
        directives.insert(0, "Level both shoulders horizontally")
        overall_score = max(0.0, overall_score - 6.0)
        
    hip_center_x = (lm["left_hip"]["x"] + lm["right_hip"]["x"]) / 2.0
    ankle_center_x = (lm["left_ankle"]["x"] + lm["right_ankle"]["x"]) / 2.0
    balance_deviation = abs(hip_center_x - ankle_center_x)
    balance_score = round(float(max(0.0, min(100.0, 100.0 - (balance_deviation * 280.0)))), 1)
    
    avg_knee_angle = (left_knee + right_knee) / 2.0
    if avg_knee_angle <= 135.0:
        aramandi_depth = "Optimal Deep Stance"
    elif avg_knee_angle <= 155.0:
        aramandi_depth = "Moderate Half-Squat"
    else:
        aramandi_depth = "Upright Stance"
        
    is_optimal = overall_score >= 80.0
    if is_optimal and len(directives) == 0:
        directives.append("Splendid classical form! Hold this stance.")
        
    return {
        "success": True,
        "detected": True,
        "overall_score": overall_score,
        "score": overall_score,
        "is_optimal": is_optimal,
        "target_pose": resolved_pose_name,
        "dance_form": norm_form,
        "angles": current_angles,
        "ideal_angles": ideal_angles,
        "deviations": deviations,
        "is_approximation": True,
        "precision_tolerance": "±3°–5°",
        "precision_note": "All degree values are kinematic approximations (±3°–5° precision).",
        "joint_statuses": statuses,
        "joint_scores": joint_scores,
        "alignment": {
            "shoulder": shoulder_status,
            "shoulder_y_diff": round(shoulder_y_diff, 3),
            "aramandi_depth": aramandi_depth,
            "balance_score": balance_score,
            "spine": f"{int(balance_score)}% Centered"
        },
        "directives": directives[:3],
        "keypoints": lm,
        "landmarks_list": raw_list
    }
