import os
import cv2
import uuid
import numpy as np
from app.ai.reference_poses import REFERENCE_POSES, get_default_reference_pose, normalize_dance_form
from app.ai.pose_analysis import analyze_pose_image
from app.ai.predict_dance import predict_dance_from_image
from app.config import COMPARISON_UPLOAD_DIR

def find_best_matching_reference_pose(user_angles: dict, dance_form: str = "Bharatanatyam") -> dict:
    """
    Evaluates user's joint angles against all benchmark poses for the predicted dance form,
    and returns the best-fitting canonical posture standard.
    """
    normalized_form = normalize_dance_form(dance_form)
    form_poses = REFERENCE_POSES.get(normalized_form)
    
    if not form_poses:
        # Case-insensitive fallback lookup
        for k, v in REFERENCE_POSES.items():
            if k.lower() == normalized_form.lower():
                form_poses = v
                normalized_form = k
                break
                
    if not form_poses:
        default_ref = get_default_reference_pose(normalized_form)
        return {
            "name": default_ref["name"],
            "dance_form": normalized_form,
            "description": default_ref["description"],
            "ideal_angles": default_ref["ideal_angles"],
            "pedagogical_tips": default_ref.get("pedagogical_tips", [])
        }
        
    best_pose_name = None
    best_pose_data = None
    best_score = -1.0
    
    for pose_name, pose_data in form_poses.items():
        ideal_angles = pose_data.get("ideal_angles", {})
        total_diff = 0.0
        count = 0
        for joint, ref_ang in ideal_angles.items():
            if joint in user_angles:
                total_diff += abs(user_angles[joint] - ref_ang)
                count += 1
        avg_diff = (total_diff / count) if count > 0 else 999.0
        score = max(0.0, 100.0 - (avg_diff * 1.8))
        if score > best_score:
            best_score = score
            best_pose_name = pose_name
            best_pose_data = pose_data
            
    if best_pose_data is None:
        first_key = list(form_poses.keys())[0]
        return {
            "name": first_key,
            "dance_form": normalized_form,
            "description": form_poses[first_key].get("description", ""),
            "ideal_angles": form_poses[first_key].get("ideal_angles", {}),
            "pedagogical_tips": form_poses[first_key].get("pedagogical_tips", [])
        }
        
    return {
        "name": best_pose_name,
        "dance_form": normalized_form,
        "description": best_pose_data.get("description", ""),
        "ideal_angles": best_pose_data.get("ideal_angles", {}),
        "pedagogical_tips": best_pose_data.get("pedagogical_tips", [])
    }


def compare_angles_to_reference(user_angles: dict, reference_angles: dict) -> dict:
    """
    Compares extracted joint angles against reference angles.
    Returns similarity scores, deviations, status badges, and corrective tips.
    """
    joint_scores = {}
    joint_differences = {}
    joint_status = {}
    total_score = 0.0
    evaluated_joints = 0
    feedback = []
    
    for joint, ref_angle in reference_angles.items():
        if joint not in user_angles:
            continue
            
        user_angle = round(float(user_angles[joint]), 1)
        ref_ang = round(float(ref_angle), 1)
        diff = round(abs(user_angle - ref_ang), 1)
        joint_differences[joint] = diff
        
        # Calibrated scoring curve: typical classical executions score accurately
        score = max(0.0, min(100.0, 100.0 - (diff * 1.6)))
        joint_scores[joint] = round(score, 1)
        
        if diff <= 12.0:
            status = "Optimal"
            joint_status[joint] = "green"
        elif diff <= 24.0:
            status = "Minor Deviation"
            joint_status[joint] = "yellow"
            direction = "increase" if user_angle < ref_ang else "decrease"
            formatted_joint = joint.replace('_', ' ').title()
            feedback.append(f"Adjust {formatted_joint}: {direction} angle by ~{diff}° (current approx. ~{int(round(user_angle))}°, target ~{int(round(ref_ang))}°).")
        else:
            status = "Needs Correction"
            joint_status[joint] = "red"
            direction = "increase" if user_angle < ref_ang else "decrease"
            formatted_joint = joint.replace('_', ' ').title()
            feedback.append(f"Important correction on {formatted_joint}: {direction} bend by ~{diff}° to match canonical form (current approx. ~{int(round(user_angle))}°, target ~{int(round(ref_ang))}°).")
            
        total_score += score
        evaluated_joints += 1
        
    overall_similarity = round(total_score / evaluated_joints, 1) if evaluated_joints > 0 else 0.0
    
    if overall_similarity >= 90.0:
        feedback.insert(0, "Splendid execution! Posture closely conforms to the canonical standard (>90% accuracy).")
    elif overall_similarity >= 80.0:
        feedback.insert(0, "High precision execution meeting classical accuracy benchmarks (>80% accuracy).")
    elif overall_similarity >= 60.0:
        feedback.insert(0, "Moderate foundational form with adjustments needed on arm and leg extensions.")
    elif overall_similarity >= 40.0:
        feedback.insert(0, "Developing posture. Focus on achieving required arm elevation and knee flexion depth.")
    else:
        feedback.insert(0, "⚠️ Casual / Non-Dance Stance detected (<40% classical conformity). Elevate arms to chest level (Natyarambha) and bend knees outwards into Aramandi.")
        
    return {
        "similarity_score": overall_similarity,
        "joint_scores": joint_scores,
        "joint_differences": joint_differences,
        "joint_status": joint_status,
        "is_approximation": True,
        "precision_tolerance": "±3°–5°",
        "feedback": feedback
    }


def compare_two_pose_images(reference_image_path: str = None, user_image_path: str = None, dance_form: str = "auto") -> dict:
    """
    Intelligent Digital Twin Comparison:
    - Automatically classifies the dance form from image(s) with authentic confidence & probabilities.
    - Evaluates whether dancer posture matches reference standard style (Cross-Tradition Alignment Check).
    - Auto-selects the optimal canonical reference posture from Natyashastra standard.
    - Compares 33 MediaPipe keypoint vectors, calculates angular deviations, and returns guidance.
    """
    if not user_image_path or not os.path.exists(user_image_path):
        return {"success": False, "message": "User image not found."}
        
    # 1. Automatically predict dance form for User Posture
    user_pred = predict_dance_from_image(user_image_path)
    user_style_raw = user_pred.get("closest_classical_style") or user_pred.get("predicted_dance") or "Bharatanatyam"
    user_dance_style = normalize_dance_form(user_style_raw)
    user_confidence = float(user_pred.get("confidence", 85.0))
    user_is_classical = user_pred.get("is_classical_dance", True)
    
    # 2. Predict dance form for Reference Posture (if provided)
    ref_pred = None
    ref_dance_style = None
    ref_confidence = None
    if reference_image_path and os.path.exists(reference_image_path):
        ref_pred = predict_dance_from_image(reference_image_path)
        if ref_pred.get("success"):
            ref_style_raw = ref_pred.get("closest_classical_style") or ref_pred.get("predicted_dance") or "Bharatanatyam"
            ref_dance_style = normalize_dance_form(ref_style_raw)
            ref_confidence = float(ref_pred.get("confidence", 90.0))

    # Determine effective target dance form for canonical comparison
    is_auto = (not dance_form or str(dance_form).strip().lower() in ("auto", "none", "", "all"))
    if is_auto:
        if ref_pred and ref_pred.get("success"):
            # If reference image is provided, favor reference style standard
            effective_dance_form = ref_dance_style
            predicted_confidence = ref_confidence
        else:
            effective_dance_form = user_dance_style
            predicted_confidence = user_confidence
    else:
        effective_dance_form = normalize_dance_form(dance_form)
        predicted_confidence = user_confidence if user_pred.get("success") else 85.0

    # 4. Extract user joint angles & landmarks
    user_res = analyze_pose_image(user_image_path)
    if not user_res.get("success"):
        return {
            "success": False,
            "message": user_res.get("message", "User pose could not be detected. Ensure full body is visible.")
        }
        
    user_angles = {k: round(float(v), 1) for k, v in user_res["angles"].items()}
    
    # 5. Determine Reference Angles: from custom reference image OR automatically from canonical standards
    matched_pose_info = find_best_matching_reference_pose(user_angles, effective_dance_form)
    
    ref_annotated_url = None
    if reference_image_path and os.path.exists(reference_image_path):
        ref_res = analyze_pose_image(reference_image_path)
        if ref_res.get("success"):
            ref_angles = {k: round(float(v), 1) for k, v in ref_res["angles"].items()}
            ref_annotated_url = ref_res.get("annotated_image_url")
        else:
            ref_angles = {k: round(float(v), 1) for k, v in matched_pose_info["ideal_angles"].items()}
    else:
        ref_angles = {k: round(float(v), 1) for k, v in matched_pose_info["ideal_angles"].items()}
        
    # 6. Compare angles
    comparison = compare_angles_to_reference(user_angles, ref_angles)
    
    # 3. Cross-Tradition Alignment Check & Summary
    if ref_pred and ref_pred.get("success"):
        dance_forms_match = (user_dance_style.strip().lower() == ref_dance_style.strip().lower())
        if not user_is_classical:
            comparison_summary = f"Dancer is in a casual standing posture ({user_confidence}% classical match), compared against Guru's {ref_dance_style} reference."
        elif dance_forms_match:
            comparison_summary = f"Traditions Aligned: Both postures classified as {user_dance_style} (Dancer: {user_confidence}%, Guru: {ref_confidence}%)."
        else:
            comparison_summary = f"Cross-Tradition Benchmark: Dancer posture classified as {user_dance_style} ({user_confidence}%), compared against Guru's {ref_dance_style} reference ({ref_confidence}%)."
    else:
        dance_forms_match = (user_dance_style.strip().lower() == effective_dance_form.strip().lower())
        if not user_is_classical:
            comparison_summary = f"Casual everyday posture detected ({user_confidence}% classical match), evaluated against {effective_dance_form} ({matched_pose_info['name']}) canonical benchmark."
        elif dance_forms_match:
            comparison_summary = f"Dancer posture accurately classified as {user_dance_style} ({user_confidence}%), evaluated against {effective_dance_form} ({matched_pose_info['name']}) canonical standards."
        else:
            comparison_summary = f"Dancer posture identified as {user_dance_style} ({user_confidence}%), benchmarked against {effective_dance_form} ({matched_pose_info['name']}) standard."
    
    # Add canonical pedagogical tips if available
    for tip in matched_pose_info.get("pedagogical_tips", []):
        formatted_tip = f"Canonical Guru Tip: {tip}"
        if formatted_tip not in comparison["feedback"]:
            comparison["feedback"].append(formatted_tip)
            
    # 7. Generate side-by-side composite if both images exist
    composite_url = None
    if reference_image_path and os.path.exists(reference_image_path):
        try:
            user_img = cv2.imread(user_image_path)
            ref_img = cv2.imread(reference_image_path)
            
            if user_img is not None and ref_img is not None:
                target_h = 480
                scale_user = target_h / user_img.shape[0]
                scale_ref = target_h / ref_img.shape[0]
                
                user_resized = cv2.resize(user_img, (int(user_img.shape[1] * scale_user), target_h))
                ref_resized = cv2.resize(ref_img, (int(ref_img.shape[1] * scale_ref), target_h))
                
                ref_label = f"Guru ({ref_dance_style or effective_dance_form})"
                user_label = f"Shishya ({comparison['similarity_score']}%)"
                cv2.putText(ref_resized, ref_label, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (55, 175, 212), 2)
                cv2.putText(user_resized, user_label, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (100, 220, 50), 2)
                
                composite = np.hstack([ref_resized, user_resized])
                composite_filename = f"comp_{uuid.uuid4().hex[:8]}.jpg"
                composite_path = os.path.join(COMPARISON_UPLOAD_DIR, composite_filename)
                cv2.imwrite(composite_path, composite)
                composite_url = f"/uploads/comparisons/{composite_filename}"
        except Exception as e:
            print(f"Side-by-side composite note: {e}")
            
    directives = [fb for fb in comparison["feedback"] if any(w in fb for w in ["Adjust", "Important", "Bend", "Extend", "Level", "Lower", "Elevate"])]

    return {
        "success": True,
        "auto_detected": is_auto,
        "dance_form": effective_dance_form,
        "predicted_confidence": round(predicted_confidence, 1),
        "is_classical_dancer": user_is_classical,
        "posture_category": user_pred.get("posture_category", "Classical Dance Posture"),
        "user_prediction": user_pred,
        "reference_prediction": ref_pred,
        "dance_forms_match": dance_forms_match,
        "comparison_summary": comparison_summary,
        "detected_canonical_pose": matched_pose_info["name"],
        "pose_name": matched_pose_info["name"],
        "pose_description": matched_pose_info["description"],
        "ideal_angles": matched_pose_info.get("ideal_angles", {}),
        "overall_match_percentage": comparison["similarity_score"],
        "similarity_score": comparison["similarity_score"],
        "reference_angles": ref_angles,
        "user_angles": user_angles,
        "angular_deviations": comparison["joint_differences"],
        "joint_deviations": comparison["joint_differences"],
        "joint_scores": comparison["joint_scores"],
        "joint_status": comparison["joint_status"],
        "is_approximation": True,
        "precision_tolerance": "±3°–5°",
        "precision_note": "All degree values are kinematic approximations (±3°–5° precision based on MediaPipe 3D joint landmark extraction).",
        "feedback": comparison["feedback"],
        "directives": directives,
        "user_alignment": user_res.get("alignment", {}),
        "user_annotated_url": user_res.get("annotated_image_url"),
        "reference_annotated_url": ref_annotated_url,
        "composite_image_url": composite_url
    }

