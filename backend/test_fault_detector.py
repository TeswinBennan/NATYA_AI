import os
import sys
import cv2
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.ai.predict_dance import predict_dance_from_image
from app.ai.fault_detector import evaluate_dance_image_fault

def create_synthetic_blank_image(filepath: str):
    """Generates an image without any human subjects (pure object/blank)."""
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    img[:] = (240, 240, 240)
    cv2.circle(img, (320, 240), 60, (50, 100, 200), -1)
    cv2.imwrite(filepath, img)
    return filepath

class MockLandmark:
    def __init__(self, x, y, z=0.0, visibility=0.9):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility

def create_mock_casual_landmarks():
    """Generates 33 landmarks for a casual standing human (arms down at sides, straight legs)."""
    lms = [MockLandmark(0.5, 0.5) for _ in range(33)]
    # Shoulders
    lms[11] = MockLandmark(0.45, 0.25) # left shoulder
    lms[12] = MockLandmark(0.55, 0.25) # right shoulder
    # Elbows straight down
    lms[13] = MockLandmark(0.44, 0.45) # left elbow
    lms[14] = MockLandmark(0.56, 0.45) # right elbow
    # Wrists at hips
    lms[15] = MockLandmark(0.44, 0.65) # left wrist
    lms[16] = MockLandmark(0.56, 0.65) # right wrist
    # Hips
    lms[23] = MockLandmark(0.46, 0.55) # left hip
    lms[24] = MockLandmark(0.54, 0.55) # right hip
    # Knees straight down
    lms[25] = MockLandmark(0.46, 0.75) # left knee
    lms[26] = MockLandmark(0.54, 0.75) # right knee
    # Ankles straight down
    lms[27] = MockLandmark(0.46, 0.95) # left ankle
    lms[28] = MockLandmark(0.54, 0.95) # right ankle
    return lms

def create_mock_dance_landmarks():
    """Generates 33 landmarks for a classical dancer in Natyarambha (arms extended) & Aramandi (squat)."""
    lms = [MockLandmark(0.5, 0.5) for _ in range(33)]
    # Shoulders
    lms[11] = MockLandmark(0.40, 0.28) # left shoulder
    lms[12] = MockLandmark(0.60, 0.28) # right shoulder
    # Arms abducted horizontally at 90 deg
    lms[13] = MockLandmark(0.25, 0.28) # left elbow out
    lms[14] = MockLandmark(0.75, 0.28) # right elbow out
    lms[15] = MockLandmark(0.20, 0.35) # left wrist
    lms[16] = MockLandmark(0.80, 0.35) # right wrist
    # Hips
    lms[23] = MockLandmark(0.43, 0.55)
    lms[24] = MockLandmark(0.57, 0.55)
    # Knees spread wide into Aramandi diamond squat
    lms[25] = MockLandmark(0.32, 0.70)
    lms[26] = MockLandmark(0.68, 0.70)
    # Feet brought together
    lms[27] = MockLandmark(0.47, 0.90)
    lms[28] = MockLandmark(0.53, 0.90)
    return lms

def run_fault_detector_tests():
    print("=" * 65)
    print("AI FAULT DETECTOR VERIFICATION SUITE")
    print("=" * 65)
    
    # ---------------------------------------------------------
    # TEST 1: NON-HUMAN / OBJECT IMAGE REJECTION
    # ---------------------------------------------------------
    print("\n[TEST 1] Testing Non-Dance / Non-Human Object Image...")
    non_human_img = os.path.join(backend_dir, "test_non_human.jpg")
    create_synthetic_blank_image(non_human_img)
    
    res1 = predict_dance_from_image(non_human_img)
    print(f"   Fault Detected: {res1.get('fault_detected')}")
    print(f"   Fault Code: {res1.get('fault_code')}")
    print(f"   Predicted Dance: {res1.get('predicted_dance')}")
    print(f"   Confidence: {res1.get('confidence')}%")
    print(f"   Is Classical Dance: {res1.get('is_classical_dance')}")
    
    assert res1.get("success") is True, "API call should return success status True"
    assert res1.get("fault_detected") is True, "Fault detector should trigger on non-human image"
    assert res1.get("fault_code") == "NO_HUMAN_DETECTED", "Fault code should be NO_HUMAN_DETECTED"
    assert res1.get("confidence") == 0.0, "Confidence must be strictly 0.0% on non-human image"
    assert res1.get("is_classical_dance") is False, "is_classical_dance must be False"
    assert "Bharatanatyam" not in res1.get("predicted_dance"), "Must NOT predict Bharatanatyam!"
    print("   -> [PASS] Test 1 Passed! Non-human image successfully rejected with 0% confidence.")
    
    # ---------------------------------------------------------
    # TEST 2: CASUAL EVERYDAY HUMAN POSTURE (GATE 4 EVALUATION)
    # ---------------------------------------------------------
    print("\n[TEST 2] Testing Casual Everyday Standing Posture (Non-Dance)...")
    mock_casual = create_mock_casual_landmarks()
    sig_empty = {"is_kathakali": False, "is_mohiniyattam": False, "is_bharatanatyam": False, "is_kathak": False}
    
    fault_res2 = evaluate_dance_image_fault(mock_casual, sig_empty)
    print(f"   Fault Detected: {fault_res2.get('fault_detected')}")
    print(f"   Fault Code: {fault_res2.get('fault_code')}")
    print(f"   Fault Title: {fault_res2.get('fault_title')}")
    print(f"   Kinematics Score: {fault_res2.get('diagnostics', {}).get('kinematics_score')}%")
    
    assert fault_res2.get("fault_detected") is True
    assert fault_res2.get("fault_code") == "NON_DANCE_POSTURE"
    assert fault_res2.get("diagnostics", {}).get("human_detected") is True
    assert fault_res2.get("diagnostics", {}).get("classical_kinematics") is False
    print("   -> [PASS] Test 2 Passed! Casual human stance correctly flagged as NON_DANCE_POSTURE.")

    # ---------------------------------------------------------
    # TEST 3: AUTHENTIC CLASSICAL DANCE POSTURE EVALUATION
    # ---------------------------------------------------------
    print("\n[TEST 3] Testing Authentic Classical Dance Kinematics...")
    mock_dance = create_mock_dance_landmarks()
    fault_res3 = evaluate_dance_image_fault(mock_dance, sig_empty)
    print(f"   Fault Detected: {fault_res3.get('fault_detected')}")
    print(f"   Fault Code: {fault_res3.get('fault_code')}")
    print(f"   Kinematics Score: {fault_res3.get('diagnostics', {}).get('kinematics_score')}%")
    
    assert fault_res3.get("fault_detected") is False
    assert fault_res3.get("fault_code") == "NONE"
    assert fault_res3.get("diagnostics", {}).get("classical_kinematics") is True
    assert fault_res3.get("diagnostics", {}).get("kinematics_score") > 60.0
    print("   -> [PASS] Test 3 Passed! Classical dance posture passes fault detector without intervention.")

    # ---------------------------------------------------------
    # TEST 4: REAL DANCE IMAGE CLASSIFIER END-TO-END
    # ---------------------------------------------------------
    print("\n[TEST 4] Testing End-to-End Real Dance Image Classification...")
    test_img = os.path.join(backend_dir, "test_image.jpg")
    if os.path.exists(test_img):
        res4 = predict_dance_from_image(test_img)
        print(f"   Predicted Dance: {res4.get('predicted_dance')}")
        print(f"   Confidence: {res4.get('confidence')}%")
        print(f"   Fault Detected: {res4.get('fault_detected')}")
        assert res4.get("fault_detected") is False
        assert res4.get("is_classical_dance") is True
        print("   -> [PASS] Test 4 Passed! Real dance image verified end-to-end.")

    # Cleanup
    if os.path.exists(non_human_img):
        os.remove(non_human_img)

    print("\n" + "=" * 65)
    print("ALL FAULT DETECTOR UNIT & INTEGRATION TESTS PASSED!")
    print("=" * 65)

if __name__ == "__main__":
    run_fault_detector_tests()
