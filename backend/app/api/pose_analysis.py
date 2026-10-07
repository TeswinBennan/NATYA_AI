import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from app.ai.pose_analysis import analyze_pose_image, evaluate_live_frame
from app.database.mongodb import analysis_collection
from app.config import POSE_UPLOAD_DIR
from app.utils.jwt_handler import get_optional_current_user

router = APIRouter(prefix="/pose-analysis", tags=["Pose Analysis"])

ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".jfif", ".webp"]

class SaveLiveSessionRequest(BaseModel):
    dance_form: str = "Bharatanatyam"
    target_pose: str = "Aramandi (Ayata)"
    overall_score: float = 85.0
    reps_completed: int = 1
    hold_duration_seconds: int = 10
    joint_deviations: dict = {}
    directives: list = []

@router.post("/analyze")
async def analyze_pose(
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
    image_path = os.path.join(POSE_UPLOAD_DIR, unique_filename)
    
    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = analyze_pose_image(image_path)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "No human pose detected in the image.")
            )
            
        # Log to MongoDB analysis collection
        if analysis_collection is not None:
            try:
                log_entry = {
                    "analysis_type": "pose_image",
                    "title": "Kinematic Pose Analysis",
                    "filename": file.filename,
                    "overall_score": result.get("overall_pose_score", 0),
                    "balance_score": result.get("alignment", {}).get("balance_score", 0),
                    "shoulder_alignment": result.get("alignment", {}).get("shoulder", "N/A"),
                    "aramandi_depth": result.get("alignment", {}).get("aramandi_depth", "N/A"),
                    "angles": result.get("angles", {}),
                    "feedback": result.get("feedback", []),
                    "annotated_image_url": result.get("annotated_image_url", ""),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History log note: {e}")
                
        return {
            "message": "Dance pose analyzed successfully",
            "filename": file.filename,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/live-frame")
async def process_live_frame(
    file: UploadFile = File(...),
    target_pose: str = Form("Aramandi (Ayata)"),
    dance_form: str = Form("Bharatanatyam")
):
    """
    Evaluates real-time live webcam frame against classical dance benchmark targets.
    Returns joint angles, accuracy score, and instant corrective directives.
    """
    try:
        contents = await file.read()
        eval_result = evaluate_live_frame(contents, target_pose=target_pose, dance_form=dance_form)
        return eval_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-live-session")
async def save_live_session(
    payload: SaveLiveSessionRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Saves a completed live camera rehearsal session to the user's Analysis Vault.
    """
    if analysis_collection is not None:
        try:
            log_entry = {
                "analysis_type": "live_camera_rehearsal",
                "title": f"Live Camera: {payload.target_pose}",
                "dance_form": payload.dance_form,
                "target_pose": payload.target_pose,
                "overall_score": payload.overall_score,
                "reps_completed": payload.reps_completed,
                "hold_duration_seconds": payload.hold_duration_seconds,
                "joint_deviations": payload.joint_deviations,
                "directives": payload.directives,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            if current_user and current_user.get("email"):
                log_entry["user_id"] = current_user.get("id")
                log_entry["user_email"] = current_user.get("email", "").strip().lower()
            res = analysis_collection.insert_one(log_entry)
            return {"success": True, "id": str(res.inserted_id), "message": "Live session saved to Vault"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"success": True, "message": "Session complete"}
