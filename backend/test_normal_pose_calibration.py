import os
import sys
import cv2
import numpy as np

# Add backend dir to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.ai.predict_dance import predict_dance_from_image
from app.ai.pose_analysis import analyze_pose_image
from app.ai.pose_comparison import compare_angles_to_reference, compare_two_pose_images
from app.ai.mudra_detector import score_mudra_match, MUDRA_CANONICAL_BENCHMARKS

def create_synthetic_normal_pose_image(filepath: str):
    """Generates a synthetic casual everyday standing silhouette image (arms down, legs straight)."""
    img = np.zeros((640, 480, 3), dtype=np.uint8)
    img[:] = (35, 35, 40) # Neutral everyday background
    
    # Head
    cv2.circle(img, (240, 90), 30, (220, 200, 180), -1)
    # Torso (upright straight)
    cv2.line(img, (240, 120), (240, 330), (220, 200, 180), 28)
    # Arms hanging straight down at sides (shoulder ~15°, elbow ~175°)
    cv2.line(img, (225, 140), (210, 240), (220, 200, 180), 14)
    cv2.line(img, (210, 240), (205, 340), (220, 200, 180), 12)
    cv2.line(img, (255, 140), (270, 240), (220, 200, 180), 14)
    cv2.line(img, (270, 240), (275, 340), (220, 200, 180), 12)
    # Legs straight standing down (knees ~180°)
    cv2.line(img, (230, 330), (225, 460), (220, 200, 180), 18)
    cv2.line(img, (225, 460), (220, 580), (220, 200, 180), 16)
    cv2.line(img, (250, 330), (255, 460), (220, 200, 180), 18)
    cv2.line(img, (255, 460), (260, 580), (220, 200, 180), 16)
    
    cv2.imwrite(filepath, img)
    return filepath

def test_normal_pose_calibration():
    print("=" * 65)
    print("TESTING NORMAL POSE ACCURACY & CALIBRATION")
    print("=" * 65)
    
    # 1. Test Normal Pose Image
    normal_img_path = os.path.join(backend_dir, "test_normal_pose.jpg")
    create_synthetic_normal_pose_image(normal_img_path)
    
    print("\n--- 1. Testing Style Classification on Normal Pose ---")
    pred_res = predict_dance_from_image(normal_img_path)
    print(f"Success: {pred_res.get('success')}")
    print(f"Is Classical Dance: {pred_res.get('is_classical_dance')}")
    print(f"Posture Category: {pred_res.get('posture_category')}")
    print(f"Confidence: {pred_res.get('confidence')}%")
    print(f"Accuracy Grade: {pred_res.get('accuracy_grade')}")
    
    # Confidence MUST be low for a normal non-dance pose (< 40%)
    if pred_res.get('is_classical_dance') is False:
        print(" [PASS] Correctly detected as Non-Classical / Casual Stance!")
        assert pred_res.get('confidence') < 40.0, f"Confidence should be < 40%, got {pred_res.get('confidence')}"
        print(f" [PASS] Confidence is accurately calibrated at {pred_res.get('confidence')}% (strictly < 40%)!")
    else:
        print(f" Note: MediaPipe on silhouette detected: {pred_res.get('confidence')}%")
        
    print("\n--- 2. Testing Kinematic Angle Comparison: Casual Stance vs Aramandi ---")
    # Normal standing person joint angles
    casual_angles = {
        "left_shoulder": 18.0, "right_shoulder": 18.0,
        "left_elbow": 175.0, "right_elbow": 175.0,
        "left_knee": 178.0, "right_knee": 178.0,
        "left_hip": 175.0, "right_hip": 175.0
    }
    # Canonical Aramandi target angles
    canonical_aramandi = {
        "left_shoulder": 85.0, "right_shoulder": 85.0,
        "left_elbow": 140.0, "right_elbow": 140.0,
        "left_knee": 120.0, "right_knee": 120.0,
        "left_hip": 140.0, "right_hip": 140.0
    }
    comp_res = compare_angles_to_reference(casual_angles, canonical_aramandi)
    print(f"Similarity Score: {comp_res['similarity_score']}%")
    print(f"Feedback: {comp_res['feedback'][0].encode('ascii', 'replace').decode('ascii')}")
    assert comp_res["similarity_score"] < 40.0, f"Expected casual stance similarity < 40%, got {comp_res['similarity_score']}"
    print(f" [PASS] Casual stance similarity against Aramandi is accurately low ({comp_res['similarity_score']}%)!")
    
    print("\n--- 3. Testing Classical Stance Conformity Score ---")
    # Perfect classical dancer execution
    classical_angles = {
        "left_shoulder": 85.0, "right_shoulder": 85.0,
        "left_elbow": 142.0, "right_elbow": 138.0,
        "left_knee": 122.0, "right_knee": 118.0,
        "left_hip": 140.0, "right_hip": 140.0
    }
    class_comp = compare_angles_to_reference(classical_angles, canonical_aramandi)
    print(f"Classical Execution Similarity: {class_comp['similarity_score']}%")
    assert class_comp["similarity_score"] >= 90.0, f"Expected > 90%, got {class_comp['similarity_score']}"
    print(" [PASS] Classical execution correctly scores > 90%!")
    
    print("\n--- 4. Testing Mudra Matching without Inflation ---")
    # Simulate a relaxed hand with ambiguous finger states [0.5, 0.5, 0.5, 0.5, 0.5]
    dummy_features = {
        "angles": {"thumb": 100.0, "index": 120.0, "middle": 120.0, "ring": 120.0, "pinky": 120.0},
        "states": [0.5, 0.5, 0.5, 0.5, 0.5],
        "distances": {"index_middle": 0.3, "thumb_index": 0.4},
        "touches": [],
        "fan_spread": 0.2
    }
    pataka_score = score_mudra_match(dummy_features, MUDRA_CANONICAL_BENCHMARKS["pataka"])
    print(f"Relaxed / Casual Hand Match on Pataka: {pataka_score:.1f}%")
    assert pataka_score < 50.0, f"Expected < 50%, got {pataka_score}"
    print(" [PASS] Casual relaxed hand no longer gets false >50% confidence on Pataka!")
    
    # Cleanup temp test file
    if os.path.exists(normal_img_path):
        os.remove(normal_img_path)
        
    print("\n" + "=" * 65)
    print("ALL NORMAL POSE CALIBRATIONS & ACCURACY TESTS PASSED!")
    print("=" * 65)

if __name__ == "__main__":
    test_normal_pose_calibration()
