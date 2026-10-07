import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.ai.predict_dance import predict_dance_from_image, predict_dance_from_video
from app.database.mongodb import analysis_collection
from app.config import IMAGES_UPLOAD_DIR, VIDEOS_UPLOAD_DIR
from app.utils.jwt_handler import get_optional_current_user

router = APIRouter(prefix="/image-prediction", tags=["Dance Style Classification"])

ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".jfif", ".webp"]
ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm", ".mkv"]

@router.post("/predict")
async def predict_dance_image(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    image_path = os.path.join(IMAGES_UPLOAD_DIR, unique_filename)
    
    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = predict_dance_from_image(image_path)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Prediction failed.")
            )
            
        # Log to history
        if analysis_collection is not None:
            try:
                log_entry = {
                    "analysis_type": "image_classification",
                    "title": "Style Classification",
                    "filename": file.filename,
                    "predicted_dance": result.get("predicted_dance"),
                    "confidence": result.get("confidence"),
                    "class_probabilities": result.get("class_probabilities", {}),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History log note: {e}")
                
        return {
            "message": "Dance style classified successfully",
            "filename": file.filename,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-video")
async def predict_dance_video(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
        
    unique_filename = f"pred_{uuid.uuid4().hex}{ext}"
    video_path = os.path.join(VIDEOS_UPLOAD_DIR, unique_filename)
    
    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = predict_dance_from_video(video_path)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Video style prediction failed.")
            )
            
        # Log to history
        if analysis_collection is not None:
            try:
                log_entry = {
                    "analysis_type": "video_classification",
                    "title": f"Video Style: {result.get('predicted_dance')}",
                    "filename": file.filename,
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
            "filename": file.filename,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
