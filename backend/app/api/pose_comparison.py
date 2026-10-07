import os
import shutil
import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Depends
from app.ai.pose_comparison import compare_two_pose_images
from app.ai.video_pose_comparison import compare_two_pose_videos
from app.ai.reference_poses import REFERENCE_POSES, normalize_dance_form
from app.database.mongodb import analysis_collection
from app.config import COMPARISON_UPLOAD_DIR, SUPPORTED_DANCE_FORMS
from app.utils.jwt_handler import get_optional_current_user

router = APIRouter(prefix="/pose-comparison", tags=["Digital Twin & Pose Comparison"])

ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".jfif", ".webp"]
ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"]

@router.get("/reference-poses")
def get_reference_poses(dance_form: Optional[str] = Query(None)):
    """Returns classical benchmark reference poses with ideal angles and descriptions."""
    if dance_form:
        form_key = normalize_dance_form(dance_form)
        if form_key in REFERENCE_POSES:
            return {form_key: REFERENCE_POSES[form_key]}
    return REFERENCE_POSES

@router.post("/compare")
async def compare_dance_poses(
    user_file: UploadFile = File(...),
    reference_file: Optional[UploadFile] = File(None),
    dance_form: str = Form("auto"),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Compares user pose against Digital Twin Guru standards.
    Automatically infers dance form and canonical pose if not specified.
    """
    user_ext = os.path.splitext(user_file.filename or "")[1].lower()
    if user_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"User image must be in format: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
        
    user_filename = f"user_{uuid.uuid4().hex}{user_ext}"
    user_path = os.path.join(COMPARISON_UPLOAD_DIR, user_filename)
    
    with open(user_path, "wb") as buffer:
        shutil.copyfileobj(user_file.file, buffer)
        
    ref_path = None
    if reference_file and reference_file.filename:
        ref_ext = os.path.splitext(reference_file.filename or "")[1].lower()
        if ref_ext in ALLOWED_IMAGE_EXTENSIONS:
            ref_filename = f"ref_{uuid.uuid4().hex}{ref_ext}"
            ref_path = os.path.join(COMPARISON_UPLOAD_DIR, ref_filename)
            with open(ref_path, "wb") as buffer:
                shutil.copyfileobj(reference_file.file, buffer)
                
    try:
        result = compare_two_pose_images(
            reference_image_path=ref_path,
            user_image_path=user_path,
            dance_form=dance_form
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Pose comparison failed.")
            )
            
        # Log to MongoDB
        if analysis_collection is not None:
            try:
                user_pred_style = result.get("user_prediction", {}).get("predicted_dance") or result.get("dance_form", "Bharatanatyam")
                effective_form = result.get("dance_form", "Bharatanatyam")
                pose_name = result.get("detected_canonical_pose") or result.get("pose_name", "Canonical Pose")
                
                log_entry = {
                    "analysis_type": "digital_twin_comparison",
                    "title": f"Digital Twin: {effective_form} - {pose_name}",
                    "dance_form": effective_form,
                    "predicted_dance_form": user_pred_style,
                    "dance_forms_match": result.get("dance_forms_match", True),
                    "comparison_summary": result.get("comparison_summary", ""),
                    "pose_name": pose_name,
                    "similarity_score": result.get("similarity_score", 0),
                    "overall_score": result.get("similarity_score", 0),
                    "joint_deviations": result.get("joint_deviations", {}),
                    "directives": result.get("directives", []) or result.get("feedback", []),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History log note: {e}")
                
        return {
            "message": "Digital Twin comparison completed successfully",
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-video")
async def compare_dance_videos(
    user_file: UploadFile = File(...),
    reference_file: Optional[UploadFile] = File(None),
    dance_form: str = Form("auto"),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Performs full temporal Motion Twin video comparison between dancer video stream
    and master Guru video stream or canonical Natyashastra motion standards.
    """
    user_ext = os.path.splitext(user_file.filename or "")[1].lower()
    if user_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Dancer video must be in format: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
        
    user_filename = f"user_vid_{uuid.uuid4().hex}{user_ext}"
    user_path = os.path.join(COMPARISON_UPLOAD_DIR, user_filename)
    
    with open(user_path, "wb") as buffer:
        shutil.copyfileobj(user_file.file, buffer)
        
    ref_path = None
    if reference_file and reference_file.filename:
        ref_ext = os.path.splitext(reference_file.filename or "")[1].lower()
        if ref_ext in ALLOWED_VIDEO_EXTENSIONS:
            ref_filename = f"ref_vid_{uuid.uuid4().hex}{ref_ext}"
            ref_path = os.path.join(COMPARISON_UPLOAD_DIR, ref_filename)
            with open(ref_path, "wb") as buffer:
                shutil.copyfileobj(reference_file.file, buffer)
                
    try:
        result = compare_two_pose_videos(
            user_video_path=user_path,
            reference_video_path=ref_path,
            dance_form=dance_form
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=422,
                detail=result.get("message", "Motion Twin video comparison failed.")
            )
            
        # Log to MongoDB
        if analysis_collection is not None:
            try:
                user_pred_style = result.get("user_prediction", {}).get("predicted_dance") or result.get("dance_form", "Bharatanatyam")
                effective_form = result.get("dance_form", "Bharatanatyam")
                pose_name = result.get("detected_canonical_pose") or result.get("pose_name", "Motion Benchmark")
                
                log_entry = {
                    "analysis_type": "digital_twin_video_comparison",
                    "title": f"Motion Twin: {effective_form} - {pose_name}",
                    "dance_form": effective_form,
                    "predicted_dance_form": user_pred_style,
                    "dance_forms_match": result.get("dance_forms_match", True),
                    "comparison_summary": result.get("comparison_summary", ""),
                    "pose_name": pose_name,
                    "similarity_score": result.get("overall_match_percentage", 0),
                    "overall_score": result.get("overall_match_percentage", 0),
                    "scores": result.get("scores", {}),
                    "joint_deviations": result.get("joint_deviations", {}),
                    "directives": result.get("directives", []) or result.get("feedback", []),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                if current_user and current_user.get("email"):
                    log_entry["user_id"] = current_user.get("id")
                    log_entry["user_email"] = current_user.get("email", "").strip().lower()
                analysis_collection.insert_one(log_entry)
            except Exception as e:
                print(f"History video log note: {e}")
                
        return {
            "message": "Motion Twin video analysis completed successfully",
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

