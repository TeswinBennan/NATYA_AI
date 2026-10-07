import os
import cv2
import uuid
import numpy as np
from app.ai.pose_detector import process_image_pose, extract_landmarks, calculate_angle, draw_classical_skeleton
from app.ai.reference_poses import get_default_reference_pose
from app.ai.predict_dance import predict_dance_from_video
from app.ai.ema_filter import EMAFilter, JointAnglesEMAFilter
from app.config import PROCESSED_VIDEOS_DIR, SUPPORTED_DANCE_FORMS

def process_dance_video_analysis(video_path: str, selected_dance_form: str = "Bharatanatyam") -> dict:
    """
    Performs frame-by-frame computer vision and pose tracking on dance video.
    Extracts pose sequence, rhythm/tempo consistency, balance stability, and renders annotated video.
    """
    if not os.path.exists(video_path):
        return {"success": False, "message": "Video file not found."}
        
    # 1. First run multi-frame temporal video dance style prediction
    style_pred = predict_dance_from_video(video_path)
    predicted_form = style_pred.get("predicted_dance", "Bharatanatyam")
    
    is_auto = (not selected_dance_form or str(selected_dance_form).strip().lower() in ("auto", "none", "", "null"))
    effective_dance_form = predicted_form if is_auto else selected_dance_form
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"success": False, "message": "Unable to read video stream."}
        
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    ref_pose = get_default_reference_pose(effective_dance_form)
    target_angles = ref_pose["ideal_angles"]
    
    output_filename = f"annotated_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(PROCESSED_VIDEOS_DIR, output_filename)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, min(fps, 30.0), (width, height))
    
    frame_idx = 0
    pose_detected_count = 0
    
    frame_scores = []
    balance_scores = []
    knee_angles = []
    elbow_angles = []
    wrist_positions = []

    # Temporal EMA Filters for smooth video playback & HUD
    knee_smoother = EMAFilter(alpha=0.35)
    elbow_smoother = EMAFilter(alpha=0.35)
    balance_smoother = EMAFilter(alpha=0.30)
    score_smoother = EMAFilter(alpha=0.35)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_idx += 1
        raw_landmarks = process_image_pose(frame)
        annotated_frame = frame.copy()
        
        if raw_landmarks is not None:
            pose_detected_count += 1
            extracted = extract_landmarks(raw_landmarks, frame.shape)
            lm = extracted["dict"]
            
            l_knee = calculate_angle([lm["left_hip"]["x"], lm["left_hip"]["y"]], [lm["left_knee"]["x"], lm["left_knee"]["y"]], [lm["left_ankle"]["x"], lm["left_ankle"]["y"]])
            r_knee = calculate_angle([lm["right_hip"]["x"], lm["right_hip"]["y"]], [lm["right_knee"]["x"], lm["right_knee"]["y"]], [lm["right_ankle"]["x"], lm["right_ankle"]["y"]])
            l_elbow = calculate_angle([lm["left_shoulder"]["x"], lm["left_shoulder"]["y"]], [lm["left_elbow"]["x"], lm["left_elbow"]["y"]], [lm["left_wrist"]["x"], lm["left_wrist"]["y"]])
            r_elbow = calculate_angle([lm["right_shoulder"]["x"], lm["right_shoulder"]["y"]], [lm["right_elbow"]["x"], lm["right_elbow"]["y"]], [lm["right_wrist"]["x"], lm["right_wrist"]["y"]])
            
            smooth_knee = knee_smoother.update((l_knee + r_knee) / 2.0)
            smooth_elbow = elbow_smoother.update((l_elbow + r_elbow) / 2.0)
            knee_angles.append(smooth_knee)
            elbow_angles.append(smooth_elbow)
            wrist_positions.append((lm["left_wrist"]["y"] + lm["right_wrist"]["y"]) / 2.0)
            
            hip_x = (lm["left_hip"]["x"] + lm["right_hip"]["x"]) / 2.0
            ankle_x = (lm["left_ankle"]["x"] + lm["right_ankle"]["x"]) / 2.0
            raw_bal = max(0.0, min(100.0, 100.0 - abs(hip_x - ankle_x) * 300.0))
            bal = balance_smoother.update(raw_bal)
            balance_scores.append(bal)
            
            knee_dev = abs(smooth_knee - target_angles.get("left_knee", 120.0))
            elbow_dev = abs(smooth_elbow - target_angles.get("left_elbow", 140.0))
            raw_f_score = max(0.0, min(100.0, 100.0 - (knee_dev * 1.2 + elbow_dev * 1.0)))
            f_score = score_smoother.update(raw_f_score)
            frame_scores.append(f_score)
            
            annotated_frame = draw_classical_skeleton(annotated_frame, raw_landmarks)
            cv2.putText(annotated_frame, f"Natyaa Live Pose: {int(f_score)}%", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (55, 175, 212), 2)
            cv2.putText(annotated_frame, f"{effective_dance_form} Standard: {ref_pose['name']}", (25, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (230, 202, 101), 2)
            
        out.write(annotated_frame)
        
    cap.release()
    out.release()
    
    avg_pose_accuracy = round(float(np.mean(frame_scores)), 1) if frame_scores else 75.0
    avg_balance = round(float(np.mean(balance_scores)), 1) if balance_scores else 80.0
    
    if len(wrist_positions) > 10:
        wrist_velocities = np.abs(np.diff(wrist_positions))
        tempo_consistency = round(float(max(40.0, min(98.0, 100.0 - np.std(wrist_velocities) * 800.0))), 1)
        zero_crossings = np.where(np.diff(np.signbit(np.diff(wrist_positions))))[0]
        estimated_bpm = int(len(zero_crossings) * (60.0 / max(1.0, total_frames / fps))) if len(zero_crossings) > 0 else 72
    else:
        tempo_consistency = 82.0
        estimated_bpm = 74
        
    movement_similarity = round(min(100.0, (avg_pose_accuracy * 0.5 + tempo_consistency * 0.3 + avg_balance * 0.2)), 1)
    
    overall_score = round((
        avg_pose_accuracy * 0.35 +
        movement_similarity * 0.25 +
        tempo_consistency * 0.20 +
        avg_balance * 0.20
    ), 1)
    
    feedback = []
    if avg_pose_accuracy >= 85:
        feedback.append(f"Outstanding posture precision conforming to {effective_dance_form} standards.")
    else:
        feedback.append(f"Focus on deepening the {ref_pose['name']} stance during movement transitions.")
        
    if tempo_consistency >= 80:
        feedback.append(f"Rhythmic footwork and mudra transitions showed steady Laya (~{estimated_bpm} BPM).")
    else:
        feedback.append("Work on maintaining consistent rhythmic timing between adavu beats.")
        
    if avg_balance >= 85:
        feedback.append("Spinal alignment and core center of mass remained stable throughout.")
    else:
        feedback.append("Keep torso steady over your feet when stepping outwards.")
        
    return {
        "success": True,
        "selected_dance_form": selected_dance_form,
        "effective_dance_form": effective_dance_form,
        "predicted_dance_form": predicted_form,
        "style_confidence": style_pred.get("confidence", 85.0),
        "class_probabilities": style_pred.get("class_probabilities", {}),
        "origin": style_pred.get("origin", "Classical India"),
        "primary_stance": style_pred.get("primary_stance", ""),
        "costume_style": style_pred.get("costume_style", ""),
        "overall_performance_score": overall_score,
        "scores": {
            "pose_accuracy": avg_pose_accuracy,
            "movement_similarity": movement_similarity,
            "rhythm_tempo": tempo_consistency,
            "body_alignment": avg_balance,
            "estimated_bpm": estimated_bpm
        },
        "statistics": {
            "total_frames": total_frames,
            "pose_detected_frames": pose_detected_count,
            "detection_rate": round((pose_detected_count / max(1, total_frames)) * 100.0, 1),
            "fps": round(fps, 1),
            "duration_seconds": round(total_frames / max(1.0, fps), 1)
        },
        "canonical_pose": ref_pose["name"],
        "pose_description": ref_pose.get("description", ""),
        "feedback": feedback,
        "annotated_video_url": f"/uploads/processed_videos/{output_filename}"
    }
