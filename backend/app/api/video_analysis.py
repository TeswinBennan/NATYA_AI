import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.ai.video_processor import process_dance_video_analysis
from app.ai.predict_dance import predict_dance_from_video
from app.database.mongodb import analysis_collection
from app.config import VIDEOS_UPLOAD_DIR, SUPPORTED_DANCE_FORMS
from app.utils.jwt_handler import get_optional_current_user

router = APIRouter(prefix="/video-analysis", tags=["Video Dance Analysis"])

ALLOWED_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm", ".mkv"]

@router.post("/analyze")
async def analyze_video(
    dance_form: str = Form("Bharatanatyam"),
    video: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    ext = os.path.splitext(video.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    video_path = os.path.join(VIDEOS_UPLOAD_DIR, unique_filename)
    
    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            
        result = process_dance_video_analysis(video_path, selected_dance_form=dance_form)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Video analysis failed.")
            )
            
        # Log to MongoDB
        if analysis_collection is not None:
            try:
                log_entry = {
                    "analysis_type": "video_performance",
                    "title": f"Video Kinematics ({dance_form})",
                    "filename": video.filename,
                    "selected_dance_form": dance_form,
                    "predicted_dance": result.get("predicted_dance_form"),
                    "overall_score": result.get("overall_performance_score", 0),
                    "pose_accuracy": result.get("scores", {}).get("pose_accuracy", 0),
                    "movement_similarity": result.get("scores", {}).get("movement_similarity", 0),
                    "rhythm_tempo": result.get("scores", {}).get("rhythm_tempo", 0),
                    "body_alignment": result.get("scores", {}).get("body_alignment", 0),
                    "estimated_bpm": result.get("scores", {}).get("estimated_bpm", 72),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History log note: {e}")
                
        return {
            "message": "Dance video analyzed successfully",
            "filename": video.filename,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-style")
async def predict_video_style(
    video: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Fast video dance form classifier:
    Uses multi-frame temporal consensus and visual costume signatures to predict classical dance form.
    """
    ext = os.path.splitext(video.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    unique_filename = f"pred_{uuid.uuid4().hex}{ext}"
    video_path = os.path.join(VIDEOS_UPLOAD_DIR, unique_filename)
    
    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            
        result = predict_dance_from_video(video_path)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Video classification failed.")
            )
            
        # Log to MongoDB
        if analysis_collection is not None:
            try:
                log_entry = {
                    "analysis_type": "video_classification",
                    "title": f"Video Style: {result.get('predicted_dance')}",
                    "filename": video.filename,
                    "predicted_dance": result.get("predicted_dance"),
                    "confidence": result.get("confidence"),
                    "class_probabilities": result.get("class_probabilities", {}),
                    "frames_sampled": result.get("frames_sampled", 0),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History log note: {e}")
                
        return {
            "message": "Dance video style predicted successfully",
            "filename": video.filename,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
