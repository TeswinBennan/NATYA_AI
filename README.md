# Natya AI: Multimodal Deep Vision & Biomechanical Digital Twin for Indian Classical Dance Pedagogy

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20%26%20Hands-orange.svg)](https://developers.google.com/mediapipe)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00.svg)](https://www.tensorflow.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Studio-black.svg)](https://threejs.org/)

**Natya AI** is an AI-powered computer-vision platform and personalized digital twin engine designed for Indian Classical Dance (*Bharatanatyam, Kathak, Kathakali, Kuchipudi, and Mohiniyattam*). Built upon canonical treatises like the *Natya Shastra* and *Abhinaya Darpana*, it provides real-time biomechanical posture assessment, hand gesture (*Mudra*) classification, and 3D digital twin visualization.

---

## Authors & Research Attribution

- **Teswin Bennan** — Department of Computer Science, Rajagiri College of Management and Applied Sciences, Kakkanad, Kochi, Kerala, India (`teswinbennan@gmail.com`)
- **Dr. Neenu Kuriakose** — Department of Computer Science, Rajagiri College of Management and Applied Sciences

> Complete scholarly manuscripts and empirical benchmarks are included in:
> - [`NATYA_AI_RESEARCH_PAPER_FINAL.md`](NATYA_AI_RESEARCH_PAPER_FINAL.md)
> - [`PERFORMANCE_ANALYSIS_AND_RESULTS.md`](PERFORMANCE_ANALYSIS_AND_RESULTS.md)

---

## Key Features

1. **Synchronous 33-Keypoint Skeletal Telemetry**:
   - Real-time kinematic tracking of body joints using MediaPipe Pose.
   - Temporal Exponential Moving Average (EMA) filtering eliminates camera optical jitter.
   - Calculates joint angles (*Aramandi*, knee outward rotation, spinal posture, shoulder balance) and bilateral symmetry.

2. **21-Landmark Hand Mudra Engine**:
   - Classifies 28 canonical single-hand (*Asamyuta*) and double-hand (*Samyuta*) Hastas (*Pataka, Tripataka, Mayura, Alapadma, etc.*).
   - Palm-scale normalized finger extension ratios and abduction angular geometry.

3. **3D Digital Twin Studio**:
   - Real-time 3D skeleton and avatar reconstruction using Three.js.
   - Spatial comparison between student execution and canonical reference geometry.

4. **Closed-Loop Directive HUD**:
   - Visual color-coded overlay providing instantaneous corrective directions (e.g., *"Lower hips into Aramandi"*, *"Align left elbow horizontal"*).
   - Dynamic Time Warping (DTW) for multi-frame sequence cadence alignment.

5. **Empirical Benchmarks**:
   - **88.5% blind testing accuracy** (88.5% F1-score) across 5 dance traditions.
   - Real-time throughput: **>30 FPS** with sub-50ms latency.
   - Strong Guru alignment correlation ($r = 0.86, p < 0.001$).

---

## System Architecture

```
NATYA_AI/
├── backend/                  # FastAPI Application & AI Pipeline
│   ├── app/
│   │   ├── ai/               # Pose analysis, Mudra classification, DTW
│   │   ├── api/              # RESTful API route endpoints
│   │   ├── core/             # Configuration & security settings
│   │   ├── models/           # Pydantic schemas & DB models
│   │   └── services/         # Business logic & telemetry services
│   ├── models/               # Pretrained neural networks (.keras, .task, .pkl)
│   ├── master_dataset.csv.gz # Gzipped canonical feature dataset
│   ├── main.py               # Backend entrypoint
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/       # UI elements, Navigation, HUD overlays
│   │   ├── pages/            # 3D Studio, Pose Analysis, Dance Practice
│   │   └── services/         # API client & WebSocket connections
│   └── package.json          # Node dependencies
│
├── dataset/                  # Multimodal dance corpus & raw images
├── figures/                  # High-resolution benchmark figures
├── scripts/                  # Model training & dataset preprocessing
├── run_dev.bat               # One-click Windows development launcher
└── README.md
```

---

## Quickstart Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **MongoDB**: (Optional, local instance for user profiles and analytics)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run FastAPI backend
uvicorn main:app --reload --port 8000
```
Backend Swagger documentation will be available at: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173`

---

### 3. One-Click Launch (Windows)

You can launch both frontend and backend concurrently using the provided batch script:
```cmd
run_dev.bat
```

---

## Pre-Trained Weights & Models

The repository bundles pre-trained models in [`backend/models/`](backend/models/):
- `dance_classifier_v1.keras` (MobileNetV2 backbone classifier)
- `dance_classifier_new.keras` (Balanced fine-tuned classifier)
- `pose_landmarker_full.task` (MediaPipe 33-point pose landmark bundle)
- `hand_landmarker.task` (MediaPipe 21-point dual hand landmark bundle)
- `label_encoder.pkl` / `scaler.pkl` (Normalization artifacts)

---

## Citation & Reference

If you use Natya AI or reference our findings in academic work, please cite:

```bibtex
@article{bennan2026natyaai,
  title={Indian Classical Dance Recognition, Performance Assessment and Pose Estimation Using Deep Learning: Natya AI},
  author={Bennan, Teswin and Kuriakose, Neenu},
  journal={Department of Computer Science, Rajagiri College of Management and Applied Sciences},
  year={2026}
}
```

---

## License

This project is licensed under the MIT License.
