from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from bson import ObjectId
from app.database.mongodb import analysis_collection
from app.utils.jwt_handler import get_current_user, get_optional_current_user

router = APIRouter(prefix="/history", tags=["Analysis History & Metrics"])

def format_record(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

@router.get("/all")
def get_all_history(limit: int = Query(50, ge=1, le=200)):
    if analysis_collection is None:
        return []
        
    cursor = analysis_collection.find({}).sort("created_at", -1).limit(limit)
    return [format_record(doc) for doc in cursor]

@router.get("/user")
def get_user_history(
    analysis_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Returns analysis history records strictly for the currently authenticated user's email / ID.
    If no user is authenticated or no email is found, returns an empty list.
    """
    if analysis_collection is None or not current_user or not current_user.get("email"):
        return []
    
    user_email = current_user.get("email", "").strip().lower()
    user_id = current_user.get("id")
    
    # Strictly query by this user's email and id
    query = {
        "$or": [
            {"user_email": user_email},
            {"user_email": current_user.get("email")},
            {"user_id": user_id}
        ]
    }
        
    if analysis_type and analysis_type != "all":
        query["analysis_type"] = analysis_type

    cursor = analysis_collection.find(query).sort("created_at", -1).limit(limit)
    return [format_record(doc) for doc in cursor]

@router.get("/user/stats")
def get_user_stats(current_user: Optional[dict] = Depends(get_optional_current_user)):
    """Returns analytics and score trends strictly for the logged-in user."""
    empty_stats = {
        "total_sessions": 0,
        "average_score": 0.0,
        "category_counts": {
            "pose_image": 0,
            "video_performance": 0,
            "image_classification": 0,
            "digital_twin_comparison": 0,
            "mudra_classification": 0
        },
        "score_history": []
    }
    
    if analysis_collection is None or not current_user or not current_user.get("email"):
        return empty_stats
        
    user_email = current_user.get("email", "").strip().lower()
    user_id = current_user.get("id")
    
    query = {
        "$or": [
            {"user_email": user_email},
            {"user_email": current_user.get("email")},
            {"user_id": user_id}
        ]
    }
        
    records = list(analysis_collection.find(query).sort("created_at", -1).limit(100))
    total = len(records)
    if total == 0:
        return empty_stats
    
    scores = []
    category_counts = {
        "pose_image": 0,
        "video_performance": 0,
        "image_classification": 0,
        "digital_twin_comparison": 0,
        "mudra_classification": 0
    }
    
    for r in records:
        t = r.get("analysis_type", "other")
        category_counts[t] = category_counts.get(t, 0) + 1
        
        s = r.get("overall_score") or r.get("similarity_score") or r.get("confidence")
        if s is not None:
            try:
                scores.append(float(s))
            except (ValueError, TypeError):
                pass
                
    avg_score = round(float(sum(scores) / len(scores)), 1) if scores else 0.0
    
    score_history = []
    for r in reversed(records[:10]):
        score_history.append({
            "date": r.get("created_at", "")[:10] if r.get("created_at") else "Recent",
            "type": r.get("analysis_type", "analysis"),
            "score": r.get("overall_score") or r.get("similarity_score") or r.get("confidence") or 0
        })
        
    return {
        "total_sessions": total,
        "average_score": avg_score,
        "category_counts": category_counts,
        "score_history": score_history
    }

@router.get("/summary")
def get_dashboard_summary():
    if analysis_collection is None:
        return {
            "total_analyses": 0,
            "average_pose_accuracy": 0.0,
            "average_overall_score": 0.0,
            "dance_form_distribution": {},
            "recent_scores": []
        }
        
    records = list(analysis_collection.find({}))
    total = len(records)
    
    if total == 0:
        return {
            "total_analyses": 0,
            "average_pose_accuracy": 0.0,
            "average_overall_score": 0.0,
            "dance_form_distribution": {"Bharatanatyam": 0, "Kathakali": 0, "Kuchipudi": 0, "Kathak": 0, "Mohiniyattam": 0},
            "recent_scores": []
        }
        
    scores = [r.get("overall_score", 0) for r in records if "overall_score" in r]
    avg_score = round(float(sum(scores) / len(scores)), 1) if scores else 84.5
    
    # Distribution
    dist = {}
    for r in records:
        form = r.get("selected_dance_form") or r.get("predicted_dance") or r.get("dance_form")
        if form:
            dist[form] = dist.get(form, 0) + 1
            
    recent_5 = records[-5:]
    recent_scores = [{
        "date": r.get("created_at", "")[:10],
        "score": r.get("overall_score", 85.0),
        "type": r.get("analysis_type", "dance_analysis")
    } for r in recent_5]
    
    return {
        "total_analyses": total,
        "average_overall_score": avg_score,
        "dance_form_distribution": dist,
        "recent_scores": recent_scores
    }

@router.get("/{record_id}")
def get_history_detail(record_id: str):
    if analysis_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    try:
        doc = analysis_collection.find_one({"_id": ObjectId(record_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Record not found")
        return format_record(doc)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{record_id}")
def delete_history_record(record_id: str):
    if analysis_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    try:
        res = analysis_collection.delete_one({"_id": ObjectId(record_id)})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"message": "Record deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

