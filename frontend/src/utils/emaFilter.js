/**
 * Exponential Moving Average (EMA) Low-Pass Filter utilities for React & Canvas.
 * Smoothes real-time webcam pose joint angles, accuracy scores, and coordinates.
 */

export class EMAFilter {
  /**
   * @param {number} alpha - Smoothing weight in (0.0, 1.0]. Lower = smoother.
   * @param {number|null} initialValue - Optional starting value.
   */
  constructor(alpha = 0.35, initialValue = null) {
    this.alpha = Math.max(0.01, Math.min(1.0, alpha));
    this.state = initialValue;
  }

  update(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return this.state ?? 0;
    }
    const num = Number(value);
    if (this.state === null) {
      this.state = num;
    } else {
      this.state = this.alpha * num + (1.0 - this.alpha) * this.state;
    }
    return Math.round(this.state * 10) / 10;
  }

  get() {
    return this.state !== null ? Math.round(this.state * 10) / 10 : null;
  }

  reset(initialValue = null) {
    this.state = initialValue;
  }
}

export class JointAnglesEMAFilter {
  /**
   * Multi-joint EMA smoother for real-time telemetry.
   * @param {number} alpha - Smoothing weight (0.35 recommended for 30fps video).
   */
  constructor(alpha = 0.35) {
    this.alpha = Math.max(0.01, Math.min(1.0, alpha));
    this.angles = {};
  }

  filter(anglesDict) {
    if (!anglesDict || typeof anglesDict !== 'object') return {};
    const smoothed = {};
    for (const [joint, rawVal] of Object.entries(anglesDict)) {
      const val = Number(rawVal);
      if (isNaN(val)) continue;

      if (this.angles[joint] === undefined) {
        this.angles[joint] = val;
      } else {
        this.angles[joint] = this.alpha * val + (1.0 - this.alpha) * this.angles[joint];
      }
      smoothed[joint] = Math.round(this.angles[joint] * 10) / 10;
    }
    return smoothed;
  }

  reset() {
    this.angles = {};
  }
}
