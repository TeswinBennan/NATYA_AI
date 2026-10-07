"""
Exponential Moving Average (EMA) Filters for Real-Time Pose Tracking & Kinematics.
Reduces camera landmark flutter, eliminates joint angle jitter, and stabilizes telemetry.
"""
from typing import Dict, List, Optional, Union, Any
import numpy as np

class EMAFilter:
    """
    Scalar Exponential Moving Average (EMA) Low-Pass Filter.
    Applies: S_t = alpha * X_t + (1 - alpha) * S_{t-1}
    """
    def __init__(self, alpha: float = 0.35, initial_value: Optional[float] = None):
        """
        :param alpha: Smoothing factor between (0.0, 1.0].
                      Typical range for 30fps webcam tracking: 0.25 to 0.40.
                      Lower alpha = smoother output (less jitter, slight lag).
                      Higher alpha = faster reaction (more responsiveness, more jitter).
        """
        assert 0.0 < alpha <= 1.0, "alpha must be in the interval (0.0, 1.0]"
        self.alpha = float(alpha)
        self.state: Optional[float] = float(initial_value) if initial_value is not None else None

    def update(self, value: Union[float, int]) -> float:
        """Updates the filter with a new sample and returns the smoothed output."""
        if value is None:
            return self.state if self.state is not None else 0.0
        val = float(value)
        if self.state is None:
            self.state = val
        else:
            self.state = self.alpha * val + (1.0 - self.alpha) * self.state
        return round(self.state, 2)

    def get(self) -> Optional[float]:
        """Returns current smoothed state without updating."""
        return round(self.state, 2) if self.state is not None else None

    def reset(self, initial_value: Optional[float] = None):
        """Resets filter memory."""
        self.state = float(initial_value) if initial_value is not None else None


class JointAnglesEMAFilter:
    """
    Multi-joint EMA filter dedicated to dance kinematic angles.
    Tracks and smooths each joint (knee, shoulder, elbow, wrist, hip) independently across frames.
    """
    def __init__(self, alpha: float = 0.30):
        assert 0.0 < alpha <= 1.0, "alpha must be in (0.0, 1.0]"
        self.alpha = float(alpha)
        self.joint_states: Dict[str, float] = {}

    def filter(self, angles_dict: Dict[str, float]) -> Dict[str, float]:
        """
        Takes raw joint angles dictionary and returns smoothed angles.
        Example input: {"left_knee": 125.4, "right_knee": 118.9, ...}
        """
        smoothed: Dict[str, float] = {}
        for joint, raw_val in angles_dict.items():
            if raw_val is None:
                continue
            v = float(raw_val)
            if joint not in self.joint_states:
                self.joint_states[joint] = v
            else:
                self.joint_states[joint] = (
                    self.alpha * v + (1.0 - self.alpha) * self.joint_states[joint]
                )
            smoothed[joint] = round(self.joint_states[joint], 2)
        return smoothed

    def reset(self):
        """Clears accumulated joint history."""
        self.joint_states.clear()


class LandmarkEMAFilter:
    """
    Landmark Coordinate EMA Filter for 33 MediaPipe Pose Landmarks.
    Filters raw 2D/3D (x, y, z) coordinates to prevent skeleton shuddering.
    """
    def __init__(self, alpha: float = 0.35):
        assert 0.0 < alpha <= 1.0, "alpha must be in (0.0, 1.0]"
        self.alpha = float(alpha)
        self.prev_landmarks: Optional[np.ndarray] = None

    def filter_array(self, landmarks_xy: Union[np.ndarray, List[List[float]]]) -> np.ndarray:
        """
        Filters an array of shape (N, 2) or (N, 3).
        """
        curr = np.array(landmarks_xy, dtype=np.float32)
        if self.prev_landmarks is None or self.prev_landmarks.shape != curr.shape:
            self.prev_landmarks = curr.copy()
            return curr

        self.prev_landmarks = self.alpha * curr + (1.0 - self.alpha) * self.prev_landmarks
        return self.prev_landmarks.copy()

    def reset(self):
        self.prev_landmarks = None
