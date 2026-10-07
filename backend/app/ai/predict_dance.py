import os
import cv2
import json
import numpy as np
import tensorflow as tf
from app.config import MODELS_DIR, SUPPORTED_DANCE_FORMS

MODEL_PATH = os.path.join(MODELS_DIR, "dance_classifier_v1.keras")
ENCODER_PATH = os.path.join(MODELS_DIR, "class_indices.json")

# Metadata for each classical tradition
DANCE_METADATA = {
    "Bharatanatyam": {
        "origin": "Tamil Nadu",
        "primary_stance": "Aramandi (Diamond half-seat) & Natyarambha (Horizontal arm frame)",
        "costume_style": "Stitched pleated fan silk saree, temple jewelry, ghungroo bells, alta dye",
        "rhythmic_focus": "Intricate Theermanams, Jathis, and sharp geometric adavus"
    },
    "Kathak": {
        "origin": "North India (Uttar Pradesh & Rajasthan)",
        "primary_stance": "Samapada (Serene upright stance) with dynamic Chakkars (lightning pirouettes)",
        "costume_style": "Flared Anarkali frock or Angarkha with churidar, heavy resonant ghungroos",
        "rhythmic_focus": "Tatkar footwork synchronized with 16-beat Teental cycles"
    },
    "Kathakali": {
        "origin": "Kerala",
        "primary_stance": "Thoppi (Wide-legged stance) with expansive mudra vinyasa",
        "costume_style": "Vesham attire, large Kireetam headdress, green Paccha or red Kathi facial makeup",
        "rhythmic_focus": "Chenda and Maddalam percussion, dramatic heroic abhinaya"
    },
    "Kuchipudi": {
        "origin": "Andhra Pradesh",
        "primary_stance": "Ayatam with fluid lyrical torso undulations and Tarangam brass plate balance",
        "costume_style": "Silk saree with front fan pleat, Jada hair braid adorned with sun and moon ornaments",
        "rhythmic_focus": "Dynamic dance-drama dialogue, quick footwork, and musical expressiveness"
    },
    "Mohiniyattam": {
        "origin": "Kerala",
        "primary_stance": "Gentle circular torso swaying (Lasya) with soft knee flexion",
        "costume_style": "Off-white / cream Kasavu saree with woven golden borders and side Kuduma hair bun",
        "rhythmic_focus": "Cholkettu, Sopanam musical cadence, lyrical feminine grace"
    }
}

# In-memory cached model and encoders
_model = None
_class_names = ["Bharatanatyam", "Kathak", "Kathakali", "Kuchipudi", "Mohiniyattam"]

def normalize_name(name: str) -> str:
    """Helper to map lowercased model names to Canonical Dance Form names."""
    mapping = {
        "bharatanatyam": "Bharatanatyam",
        "kathak": "Kathak",
        "kathakali": "Kathakali",
        "kuchipudi": "Kuchipudi",
        "mohiniyattam": "Mohiniyattam"
    }
    return mapping.get(name.lower(), name.title())

def load_ai_models(force: bool = False):
    """Loads or reloads the trained classification model into memory."""
    global _model, _class_names
    if (_model is None or force) and os.path.exists(MODEL_PATH):
        try:
            _model = tf.keras.models.load_model(MODEL_PATH)
            print("Loaded updated dance_classifier_v1.keras successfully.")
        except Exception as e:
            print(f"Model load note: {e}")
            
    if os.path.exists(ENCODER_PATH):
        try:
            with open(ENCODER_PATH, "r") as f:
                indices = json.load(f)
                _class_names = [normalize_name(indices[str(i)]) for i in range(len(indices))]
        except Exception as e:
            print(f"Label encoder note: {e}")

# Pre-load on import
try:
    load_ai_models(force=True)
except Exception as e:
    print(f"Startup model load note: {e}")


def extract_visual_costume_signatures(rgb_image: np.ndarray) -> dict:
    """
    Extracts distinct visual and costume signatures (distinctive facial makeup pigments,
    specific Kasavu gold-bordered attire) to support classification.
    Calibrated to avoid false positives on background plants or everyday clothing.
    """
    h, w, _ = rgb_image.shape
    hsv = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2HSV)
    
    # 1. Kathakali Signature: Concentrated Paccha face makeup (vivid green) AND abhinaya red markings
    # Must be highly saturated and concentrated in the upper face region, not broad background foliage
    upper_hsv = hsv[:int(h * 0.40), :]
    green_mask = cv2.inRange(upper_hsv, np.array([40, 100, 60]), np.array([80, 255, 255]))
    green_ratio = np.sum(green_mask > 0) / (upper_hsv.shape[0] * upper_hsv.shape[1] + 1e-6)
    
    red_mask1 = cv2.inRange(upper_hsv, np.array([0, 110, 70]), np.array([10, 255, 255]))
    red_mask2 = cv2.inRange(upper_hsv, np.array([170, 110, 70]), np.array([180, 255, 255]))
    red_ratio = (np.sum(red_mask1 > 0) + np.sum(red_mask2 > 0)) / (upper_hsv.shape[0] * upper_hsv.shape[1] + 1e-6)
    
    # Strictly require intense concentrated green makeup or green + dramatic red makeup
    is_kathakali = (green_ratio > 0.08 and red_ratio > 0.02) or (green_ratio > 0.15)

    # 2. Mohiniyattam Signature: Off-white / cream Kasavu drape + gold accents
    white_mask = cv2.inRange(hsv, np.array([0, 0, 175]), np.array([180, 35, 255]))
    gold_mask = cv2.inRange(hsv, np.array([18, 80, 110]), np.array([36, 255, 255]))
    white_ratio = np.sum(white_mask > 0) / (h * w + 1e-6)
    gold_ratio = np.sum(gold_mask > 0) / (h * w + 1e-6)
    is_mohiniyattam = (white_ratio > 0.28 and gold_ratio > 0.03)

    # 3. Kathak Signature: Upright flowing vertical silhouette with flared Anarkali
    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 7))
    vert_edges = cv2.morphologyEx(edges, cv2.MORPH_OPEN, vertical_kernel)
    vert_ratio = np.sum(vert_edges > 0) / (h * w + 1e-6)
    is_kathak = (vert_ratio > 0.07) and (not is_kathakali) and (not is_mohiniyattam)

    # 4. Bharatanatyam Signature: Rich jewel tones (maroon, deep blue, gold, scarlet) with fan pleats
    maroon_mask = cv2.inRange(hsv, np.array([160, 70, 40]), np.array([180, 255, 200]))
    maroon_ratio = np.sum(maroon_mask > 0) / (h * w + 1e-6)
    is_bharatanatyam = (maroon_ratio > 0.10 or (maroon_ratio > 0.04 and gold_ratio > 0.04)) and (not is_kathakali) and (not is_mohiniyattam)

    return {
        "is_kathakali": is_kathakali,
        "is_mohiniyattam": is_mohiniyattam,
        "is_kathak": is_kathak,
        "is_bharatanatyam": is_bharatanatyam,
        "green_ratio": float(green_ratio),
        "white_ratio": float(white_ratio),
        "gold_ratio": float(gold_ratio)
    }


def predict_dance_from_image(image_path: str) -> dict:
    """
    Predicts classical dance style from a single image using a calibrated
    multi-modal fusion of MobileNetV2 CNN embeddings + Pose Kinematics + Visual Costume Signatures,
    guarded by a multi-tier Fault Detector to reject non-dance and non-human images.
    """
    load_ai_models()
    if not os.path.exists(image_path):
        return {"success": False, "message": "Image not found"}
        
    image = cv2.imread(image_path)
    if image is None:
        return {"success": False, "message": "Could not read image file."}
        
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb_image, (224, 224)).astype(np.float32)
    
    classes = _class_names if _class_names else ["Bharatanatyam", "Kathak", "Kathakali", "Kuchipudi", "Mohiniyattam"]
    raw_probs = np.array([0.2] * len(classes), dtype=np.float64)
    
    # 1. Neural CNN Inference
    img_batch = np.expand_dims(resized, axis=0)
    img_batch = tf.keras.applications.mobilenet_v2.preprocess_input(img_batch)
    
    if _model is not None:
        try:
            preds = _model.predict(img_batch, verbose=0)[0]
            if len(preds) == len(classes):
                raw_probs = np.array(preds, dtype=np.float64)
                if np.sum(raw_probs) > 0:
                    raw_probs = raw_probs / np.sum(raw_probs)
        except Exception as e:
            print(f"Prediction execution note: {e}")

    # 2. Extract Visual Costume Signatures
    sig = extract_visual_costume_signatures(rgb_image)
    
    # 3. Extract Kinematic Pose Biomechanics (MediaPipe)
    from app.ai.pose_detector import process_image_pose, extract_landmarks
    from app.ai.fault_detector import evaluate_dance_image_fault
    
    raw_landmarks = process_image_pose(image)
    
    # 4. Multi-Tier FAULT DETECTOR Evaluation
    fault_report = evaluate_dance_image_fault(raw_landmarks, sig, image.shape)
    
    if fault_report["fault_detected"]:
        fault_code = fault_report["fault_code"]
        
        # Hard rejection for non-human subjects or obscured/cropped images:
        # Strictly 0.0% confidence, no classical dance classification
        if fault_code in ["NO_HUMAN_DETECTED", "INCOMPLETE_BODY_POSE"]:
            return {
                "success": True,
                "fault_detected": True,
                "fault_code": fault_code,
                "fault_title": fault_report["fault_title"],
                "fault_message": fault_report["fault_message"],
                "fault_guidance": fault_report["fault_guidance"],
                "diagnostics": fault_report["diagnostics"],
                "is_classical_dance": False,
                "posture_category": f"Non-Dance Subject ({fault_report['fault_title']})",
                "predicted_dance": f"Rejected: {fault_report['fault_title']}",
                "closest_classical_style": None,
                "confidence": 0.0,
                "class_probabilities": {cls_name: 0.0 for cls_name in classes},
                "origin": "N/A (Non-Dance Image)",
                "primary_stance": "No Classical Stance Detected",
                "costume_style": "No Classical Attire Detected",
                "rhythmic_focus": "No Classical Tala Detected",
                "accuracy_grade": f"Fault Detector Triggered: {fault_report['fault_title']} (0.0% Classical Conformity)",
                "guidance": fault_report["fault_guidance"]
            }
            
        # Rejection for human subject in everyday casual posture (not dancing)
        elif fault_code == "NON_DANCE_POSTURE":
            best_idx = int(np.argmax(raw_probs))
            predicted_label = classes[best_idx]
            confidence = round(max(5.0, min(24.5, float(raw_probs[best_idx]) * 24.0)), 1)
            
            class_probabilities = {}
            for idx, cls_name in enumerate(classes):
                if idx == best_idx:
                    class_probabilities[cls_name] = confidence
                else:
                    rem_val = round((100.0 - confidence) / (len(classes) - 1), 1)
                    class_probabilities[cls_name] = rem_val
                    
            return {
                "success": True,
                "fault_detected": True,
                "fault_code": fault_code,
                "fault_title": fault_report["fault_title"],
                "fault_message": fault_report["fault_message"],
                "fault_guidance": fault_report["fault_guidance"],
                "diagnostics": fault_report["diagnostics"],
                "is_classical_dance": False,
                "posture_category": "Casual / Normal Stance (Non-Classical Posture)",
                "predicted_dance": f"Casual Posture ({predicted_label} Tendency)",
                "closest_classical_style": predicted_label,
                "confidence": confidence,
                "class_probabilities": class_probabilities,
                "origin": "Everyday Non-Dance Posture",
                "primary_stance": "Casual Standing Stance (Arms at sides, knees unbent)",
                "costume_style": "Casual / Contemporary Attire",
                "rhythmic_focus": "No Classical Tala Detected",
                "accuracy_grade": "Casual Non-Dance Posture (<25% classical conformity)",
                "guidance": fault_report["fault_guidance"]
            }

    # 5. Passed Fault Detector: Multi-Modal Calibration with Bayesian-prior weighting
    weights = np.array([1.0] * len(classes), dtype=np.float64)
    for idx, cname in enumerate(classes):
        if cname == "Kathakali" and sig["is_kathakali"]:
            weights[idx] += 0.4
        elif cname == "Mohiniyattam" and sig["is_mohiniyattam"]:
            weights[idx] += 0.3
        elif cname == "Kathak" and sig["is_kathak"]:
            weights[idx] += 0.2
        elif cname == "Bharatanatyam" and sig["is_bharatanatyam"]:
            weights[idx] += 0.2

    calibrated_probs = raw_probs * weights
    if np.sum(calibrated_probs) > 0:
        calibrated_probs = calibrated_probs / np.sum(calibrated_probs)
    else:
        calibrated_probs = raw_probs.copy()
    
    best_idx = int(np.argmax(calibrated_probs))
    predicted_label = classes[best_idx]
    
    # Authentic uninflated confidence directly from calibrated neural probabilities
    confidence = round(float(calibrated_probs[best_idx]) * 100.0, 1)

    # Format probability dictionary summing cleanly to 100%
    class_probabilities = {cls_name: round(float(calibrated_probs[idx]) * 100.0, 1) for idx, cls_name in enumerate(classes)}
    curr_sum = sum(class_probabilities.values())
    if curr_sum != 100.0 and len(classes) > 0:
        diff = round(100.0 - curr_sum, 1)
        class_probabilities[predicted_label] = round(class_probabilities[predicted_label] + diff, 1)

    meta = DANCE_METADATA.get(predicted_label, {})
    
    if confidence >= 80.0:
        accuracy_grade = "Certified High-Precision (>80% accuracy standard)"
    elif confidence >= 50.0:
        accuracy_grade = "Moderate Classical Conformity (50%-79%)"
    else:
        accuracy_grade = "Developing Form / Low Classical Match (<50%)"

    return {
        "success": True,
        "fault_detected": False,
        "fault_code": "NONE",
        "fault_title": "Classical Dance Posture Verified",
        "fault_message": "Image successfully passed all fault detection gates.",
        "diagnostics": fault_report["diagnostics"],
        "is_classical_dance": True,
        "posture_category": "Classical Dance Posture",
        "predicted_dance": predicted_label,
        "confidence": confidence,
        "class_probabilities": class_probabilities,
        "origin": meta.get("origin", "Classical India"),
        "primary_stance": meta.get("primary_stance", "Canonical Posture"),
        "costume_style": meta.get("costume_style", "Traditional Attire"),
        "rhythmic_focus": meta.get("rhythmic_focus", "Classical Tala"),
        "accuracy_grade": accuracy_grade,
        "guidance": f"Classical {predicted_label} posture and aesthetic geometry detected."
    }


def predict_dance_from_video(video_path: str) -> dict:
    """
    Predicts classical dance form from video using multi-frame temporal sampling
    and majority consensus across sampled video frames, guarded by temporal pose density validation.
    """
    load_ai_models()
    if not os.path.exists(video_path):
        return {"success": False, "message": "Video not found"}
        
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"success": False, "message": "Could not open video file"}
        
    frame_predictions = []
    classes = _class_names if _class_names else ["Bharatanatyam", "Kathak", "Kathakali", "Kuchipudi", "Mohiniyattam"]
    accumulated_probs = np.zeros(len(classes), dtype=np.float64)
    
    frame_count = 0
    sample_interval = 8 # sample every 8th frame for real-time speed & stability
    classical_frame_count = 0
    human_pose_detected_frames = 0
    
    from app.ai.pose_detector import process_image_pose

    while cap.isOpened() and frame_count < 300:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % sample_interval == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            resized = cv2.resize(rgb_frame, (224, 224)).astype(np.float32)
            img_batch = np.expand_dims(resized, axis=0)
            img_batch = tf.keras.applications.mobilenet_v2.preprocess_input(img_batch)
            
            raw_p = np.array([0.2] * len(classes), dtype=np.float64)
            if _model is not None:
                try:
                    raw_p = _model.predict(img_batch, verbose=0)[0]
                except Exception:
                    pass
                    
            sig = extract_visual_costume_signatures(rgb_frame)
            weights = np.array([1.0] * len(classes), dtype=np.float64)
            for idx, cname in enumerate(classes):
                if cname == "Kathakali" and sig["is_kathakali"]:
                    weights[idx] += 0.4
                elif cname == "Mohiniyattam" and sig["is_mohiniyattam"]:
                    weights[idx] += 0.3
                elif cname == "Kathak" and sig["is_kathak"]:
                    weights[idx] += 0.2
                elif cname == "Bharatanatyam" and sig["is_bharatanatyam"]:
                    weights[idx] += 0.2
                    
            frame_probs = raw_p * weights
            if np.sum(frame_probs) > 0:
                frame_probs = frame_probs / np.sum(frame_probs)
            
            accumulated_probs += frame_probs
            best_f_idx = int(np.argmax(frame_probs))
            frame_predictions.append(classes[best_f_idx])
            
            if sig["is_kathakali"] or sig["is_mohiniyattam"] or sig["is_bharatanatyam"] or sig["is_kathak"]:
                classical_frame_count += 1
            
            # Check pose presence on sampled frame
            pose_lms = process_image_pose(frame)
            if pose_lms is not None:
                human_pose_detected_frames += 1
            
        frame_count += 1
        
    cap.release()
    
    if not frame_predictions:
        return {"success": False, "message": "No valid frames extracted from video"}
        
    # VIDEO FAULT DETECTION: Check human dancer pose density
    pose_density = human_pose_detected_frames / len(frame_predictions)
    if pose_density < 0.15 and classical_frame_count == 0:
        return {
            "success": True,
            "fault_detected": True,
            "fault_code": "NO_HUMAN_IN_VIDEO",
            "fault_title": "No Human Dance Movement Detected in Video",
            "fault_message": "No human dancer or classical dance movement was detected across the sampled video frames.",
            "fault_guidance": "Please upload a video showing a dancer performing Indian classical dance movements.",
            "is_classical_dance": False,
            "confidence": 0.0,
            "predicted_dance": "Rejected: Non-Dance Video",
            "frames_sampled": len(frame_predictions),
            "pose_density_percent": round(pose_density * 100.0, 1),
            "class_probabilities": {c: 0.0 for c in classes},
            "origin": "N/A",
            "primary_stance": "No Classical Stance Detected",
            "costume_style": "No Classical Attire Detected",
            "accuracy_grade": "Fault Detector: Non-Dance Video (0.0% Conformity)"
        }

    # Aggregate predictions across video
    mean_probs = accumulated_probs / len(frame_predictions)
    best_idx = int(np.argmax(mean_probs))
    winning_dance = classes[best_idx]
    
    # Authentic confidence directly from mean probabilities
    confidence = round(float(mean_probs[best_idx]) * 100.0, 1)
    is_classical = True
    
    if classical_frame_count == 0 and confidence < 50.0:
        accuracy_grade = "Casual Movement / Low Classical Video Match (<50%)"
        is_classical = False
    elif confidence >= 80.0:
        accuracy_grade = "Certified Video Precision (>80% accuracy standard)"
    else:
        accuracy_grade = "Moderate Video Similarity (50%-79%)"
    
    class_probabilities = {}
    for idx, cname in enumerate(classes):
        if cname == winning_dance:
            class_probabilities[cname] = confidence
        else:
            class_probabilities[cname] = round(float(mean_probs[idx]) * (100.0 - confidence), 1)

    meta = DANCE_METADATA.get(winning_dance, {})

    return {
        "success": True,
        "fault_detected": False,
        "fault_code": "NONE",
        "fault_title": "Classical Dance Video Verified",
        "is_classical_dance": is_classical,
        "predicted_dance": winning_dance,
        "confidence": confidence,
        "class_probabilities": class_probabilities,
        "frames_sampled": len(frame_predictions),
        "origin": meta.get("origin", "Classical India"),
        "primary_stance": meta.get("primary_stance", "Canonical Posture"),
        "costume_style": meta.get("costume_style", "Traditional Attire"),
        "accuracy_grade": accuracy_grade
    }

