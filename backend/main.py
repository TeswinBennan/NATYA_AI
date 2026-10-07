import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import ALLOWED_ORIGINS, UPLOADS_DIR, PORT, HOST, DEBUG

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Routers
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.dataset import router as dataset_router
from app.api.pose_analysis import router as pose_analysis_router
from app.api.pose_comparison import router as pose_comparison_router
from app.api.image_prediction import router as image_prediction_router
from app.api.video_analysis import router as video_analysis_router
from app.api.history import router as history_router
from app.api.knowledge import router as knowledge_router
from app.api.mudra import router as mudra_router
from app.api.guru_chat import router as guru_chat_router

app = FastAPI(
    title="Natyaa AI - Classical Dance AI Platform",
    description="Full-stack AI platform for Bharatanatyam, Kathakali, Kuchipudi, Kathak, and Mohiniyattam analysis, pose estimation, digital twin motion comparison, and mudras.",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads, annotated images, and processed videos
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include Routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(dataset_router, prefix="/api")
app.include_router(pose_analysis_router, prefix="/api")
app.include_router(pose_comparison_router, prefix="/api")
app.include_router(image_prediction_router, prefix="/api")
app.include_router(video_analysis_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")
app.include_router(mudra_router, prefix="/api")
app.include_router(guru_chat_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "Natyaa AI",
        "description": "AI-Powered Classical Dance Motion Analysis & Digital Twin Platform",
        "status": "active",
        "version": "2.0.0",
        "docs_url": "/docs",
        "supported_forms": ["Bharatanatyam", "Kathakali", "Kuchipudi", "Kathak", "Mohiniyattam"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
