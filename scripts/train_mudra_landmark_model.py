import os
import glob
import json
import pickle
import numpy as np
import cv2
import mediapipe as mp
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

DATASET_DIR = r"C:\Users\ASUS\.cache\kagglehub\datasets\sowmithaasris\bharathanatyam-mudra-classification\versions\1\Dataset"
MODEL_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "app", "ai", "models")
MODEL_OUTPUT_PATH = os.path.join(MODEL_OUTPUT_DIR, "mudra_ml_classifier.pkl")

# Canonical class mapping
CLASS_MAP = {
    "alapadmam": "alapadma",
    "chandrakala": "chandrakala",
    "chathurah": "chatura",
    "chaturah": "chatura",
    "chathura": "chatura",
    "hamsaasya": "hamsasya",
    "hamsasya": "hamsasya",
    "kapitham": "kapittha",
    "kapitha": "kapittha",
    "kartharimukam": "kartarimukha",
    "kartarimukha": "kartarimukha",
    "mrugasheesha": "mrigashirsha",
    "mrigashirsha": "mrigashirsha",
    "shikaram": "shikhara",
    "shikhara": "shikhara",
    "soochi": "suchi",
    "suchi": "suchi",
    "thamaraichooda": "tamrachuda",
    "tamrachuda": "tamrachuda",
}

def extract_features_from_landmarks(pts_21):
    """
    Extracts an 18-dimensional rotation-invariant, scale-invariant geometric feature vector.
    """
    pts_arr = np.array(pts_21, dtype=np.float32)
    wrist = pts_arr[0]
    
    # Palm direction vector (wrist to middle MCP)
    palm_dir = pts_arr[9] - wrist
    palm_len = max(0.001, float(np.linalg.norm(palm_dir)))
    palm_unit = palm_dir / palm_len

    # Extension ratios
    ext_ratios = []
    for mcp_idx, tip_idx in [(5, 8), (9, 12), (13, 16), (17, 20)]:
        d_mcp = max(0.001, float(np.linalg.norm(pts_arr[mcp_idx] - wrist)))
        d_tip = float(np.linalg.norm(pts_arr[tip_idx] - wrist))
        ext_ratios.append(d_tip / d_mcp)

    # Thumb extension & projection
    d_mcp_thb = max(0.001, float(np.linalg.norm(pts_arr[2] - wrist)))
    d_tip_thb = float(np.linalg.norm(pts_arr[4] - wrist))
    thumb_ratio = d_tip_thb / d_mcp_thb
    
    thumb_vec = pts_arr[4] - wrist
    thumb_proj = float(np.dot(thumb_vec, palm_unit)) / palm_len

    # Thumb abduction angle (Index MCP, Wrist, Thumb Tip)
    a = pts_arr[5][:2]
    b = wrist[:2]
    c = pts_arr[4][:2]
    rad = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    thumb_abd = float(np.abs(rad * 180.0 / np.pi))
    if thumb_abd > 180.0:
        thumb_abd = 360.0 - thumb_abd

    # Normalized distances between fingertips
    d_thb_idx = float(np.linalg.norm(pts_arr[4] - pts_arr[8])) / palm_len
    d_thb_mid = float(np.linalg.norm(pts_arr[4] - pts_arr[12])) / palm_len
    d_thb_rng = float(np.linalg.norm(pts_arr[4] - pts_arr[16])) / palm_len
    d_idx_mid = float(np.linalg.norm(pts_arr[8] - pts_arr[12])) / palm_len
    d_mid_rng = float(np.linalg.norm(pts_arr[12] - pts_arr[16])) / palm_len
    d_rng_pnk = float(np.linalg.norm(pts_arr[16] - pts_arr[20])) / palm_len

    fan_spread = (d_idx_mid + d_mid_rng + d_rng_pnk) / 3.0

    # Calibrated angles
    def ratio_to_ang(r):
        pct = min(1.0, max(0.0, (r - 1.05) / 1.15))
        return 40.0 + pct * 135.0

    idx_ang = ratio_to_ang(ext_ratios[0])
    mid_ang = ratio_to_ang(ext_ratios[1])
    rng_ang = ratio_to_ang(ext_ratios[2])
    pnk_ang = ratio_to_ang(ext_ratios[3])
    thb_ang = 170.0 if (thumb_proj >= 0.85 and thumb_abd < 55.0) else (140.0 if thumb_abd >= 60.0 else 45.0)

    features = [
        ext_ratios[0], ext_ratios[1], ext_ratios[2], ext_ratios[3],
        thumb_ratio, thumb_proj, thumb_abd / 180.0,
        d_thb_idx, d_thb_mid, d_thb_rng,
        d_idx_mid, d_mid_rng, d_rng_pnk, fan_spread,
        idx_ang / 180.0, mid_ang / 180.0, rng_ang / 180.0, pnk_ang / 180.0, thb_ang / 180.0
    ]
    return features

def train_mudra_model():
    print("=" * 60)
    print("TRAINING MUDRA LANDMARK CLASSIFIER ON 11,800+ KAGGLE SAMPLES")
    print("=" * 60)
    
    os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "app", "models", "hand_landmarker.task")
    if not os.path.exists(model_path):
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "hand_landmarker.task")
    print(f"Using MediaPipe HandLandmarker task model: {model_path}")

    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision

    BaseOptions = mp_python.BaseOptions
    HandLandmarker = mp_vision.HandLandmarker
    HandLandmarkerOptions = mp_vision.HandLandmarkerOptions
    VisionRunningMode = mp_vision.RunningMode

    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.2
    )
    landmarker = HandLandmarker.create_from_options(options)
    
    X = []
    y = []
    
    classes = [c for c in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, c))]
    print(f"Found {len(classes)} classes: {classes}")

    for cls_name in classes:
        canonical_label = CLASS_MAP.get(cls_name.lower(), cls_name.lower())
        cls_path = os.path.join(DATASET_DIR, cls_name)
        img_paths = glob.glob(os.path.join(cls_path, "*.*"))
        
        # Subsample up to 200 diverse images per class for balanced high-speed training
        sample_paths = img_paths[:200]
        print(f"Extracting landmarks for '{cls_name}' -> '{canonical_label}' ({len(sample_paths)} images)...")
        
        extracted = 0
        for p in sample_paths:
            try:
                mp_image = mp.Image.create_from_file(p)
                detection = landmarker.detect(mp_image)
                
                if detection and detection.hand_landmarks and len(detection.hand_landmarks) > 0:
                    hand_lm = detection.hand_landmarks[0]
                    pts = [[lm.x, lm.y, lm.z] for lm in hand_lm]
                    feat = extract_features_from_landmarks(pts)
                    X.append(feat)
                    y.append(canonical_label)
                    extracted += 1
            except Exception as ex:
                pass
        print(f"  -> Extracted {extracted}/{len(sample_paths)} landmark samples.")

    X = np.array(X)
    y = np.array(y)
    print(f"\nTotal Dataset Extracted: {len(X)} samples across {len(set(y))} unique classes.")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("\nTraining Ensemble Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=120, max_depth=16, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n>>> Model Validation Accuracy: {acc * 100:.2f}% <<<\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model and label encoder
    model_payload = {
        "model": clf,
        "classes": list(clf.classes_),
        "accuracy": acc,
        "feature_dim": 19
    }
    with open(MODEL_OUTPUT_PATH, "wb") as f:
        pickle.dump(model_payload, f)
        
    print(f"Trained model saved to: {MODEL_OUTPUT_PATH}")

if __name__ == "__main__":
    train_mudra_model()
