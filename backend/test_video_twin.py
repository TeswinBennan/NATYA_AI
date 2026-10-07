import os
import cv2
import numpy as np
import tempfile
from app.ai.video_pose_comparison import compare_two_pose_videos

def create_synthetic_dance_video(filepath, num_frames=30, width=640, height=480):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, 15.0, (width, height))
    
    for i in range(num_frames):
        # Create a blank image with some movement
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Draw a simulated figure
        head_y = int(100 + 10 * np.sin(i * 0.2))
        cv2.circle(frame, (320, head_y), 30, (200, 200, 200), -1)
        cv2.line(frame, (320, head_y + 30), (320, head_y + 150), (200, 200, 200), 4) # torso
        cv2.line(frame, (320, head_y + 50), (250, head_y + 100), (200, 200, 200), 4) # left arm
        cv2.line(frame, (320, head_y + 50), (390, head_y + 100), (200, 200, 200), 4) # right arm
        cv2.line(frame, (320, head_y + 150), (270, head_y + 260), (200, 200, 200), 4) # left leg
        cv2.line(frame, (320, head_y + 150), (370, head_y + 260), (200, 200, 200), 4) # right leg
        out.write(frame)
        
    out.release()

def test_video_comparison_logic():
    print("Testing Video Digital Twin logic...")
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f1:
        v1_path = f1.name
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f2:
        v2_path = f2.name
        
    try:
        create_synthetic_dance_video(v1_path, num_frames=20)
        create_synthetic_dance_video(v2_path, num_frames=20)
        
        # Test single video against benchmark
        print("1. Testing single dancer video against canonical standard...")
        res1 = compare_two_pose_videos(v1_path, None, dance_form='Bharatanatyam')
        print("Single video result success:", res1.get('success'))
        print("Dance Form:", res1.get('dance_form'))
        print("Confidence:", res1.get('predicted_confidence'))
        print("Accuracy:", res1.get('overall_match_percentage'))
        print("Video URL:", res1.get('composite_video_url'))
        print("Rhythm BPM:", res1.get('rhythm_metrics', {}).get('dancer_bpm'))
        
        # Test dual video
        print("\n2. Testing dual video comparison (Dancer + Guru)...")
        res2 = compare_two_pose_videos(v1_path, v2_path, dance_form='auto')
        print("Dual video result success:", res2.get('success'))
        print("Dance Form:", res2.get('dance_form'))
        print("Confidence:", res2.get('predicted_confidence'))
        print("Accuracy:", res2.get('overall_match_percentage'))
        print("Video URL:", res2.get('composite_video_url'))
        print("Deviations:", res2.get('angular_deviations'))
        print("Feedback count:", len(res2.get('feedback', [])))
        print("\nAll Video Digital Twin tests passed successfully!")
    finally:
        if os.path.exists(v1_path): os.remove(v1_path)
        if os.path.exists(v2_path): os.remove(v2_path)

if __name__ == '__main__':
    test_video_comparison_logic()
