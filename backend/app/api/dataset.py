import os
import shutil
import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Depends
from bson import ObjectId
from app.config import DATASET_DIR, UPLOADS_DIR, SUPPORTED_DANCE_FORMS
from app.database.mongodb import dataset_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/dataset", tags=["Dataset Management"])

DATASET_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "dataset_samples")
os.makedirs(DATASET_UPLOAD_DIR, exist_ok=True)

# Target per category
TARGET_PER_CATEGORY = 500

def init_dataset_seed():
    """Initializes dataset catalog with 5 classical categories if empty."""
    if dataset_collection is None:
        return
    
    count = dataset_collection.count_documents({})
    if count == 0:
        seed_samples = []
        # Predefined classical postures per dance form
        postures = {
            "Bharatanatyam": ["Aramandi", "Muzhumandi", "Natyarambha", "Alidha", "Garuda Mudra", "Tripataka", "Samapada"],
            "Kathakali": ["Pakarcha", "Mudras Mudra", "Kalasam", "Chuzhippu", "Todangal", "Mudra Mayuram"],
            "Kuchipudi": ["Manduka Shabdam", "Tarangam Brass Plate Balance", "Tribhanga", "Jathi", "Natya Shloka"],
            "Kathak": ["Chakkar Spin", "Tatkar Footwork", "Hastak Mudra", "Sama Stance", "Kavitt"],
            "Mohiniyattam": ["Andolika Sway", "Cholkettu Posture", "Hamsasya Mudra", "Sthiratha", "Nila Chari"]
        }
        
        for form, form_postures in postures.items():
            for i, posture in enumerate(form_postures):
                seed_samples.append({
                    "dance_form": form,
                    "title": f"{form} - {posture} Demonstration",
                    "dancer_name": "Classical Dance Archive",
                    "posture_name": posture,
                    "filename": f"{form.lower()}_{i+1}.jpg",
                    "file_path": f"/images/{form.lower()}.jpg",
                    "file_type": "image/jpeg",
                    "file_size_bytes": 1024 * (50 + i * 20),
                    "tags": [form.lower(), posture.lower(), "classical", "heritage"],
                    "source": "Natyaa AI Master Dataset",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
        
        if seed_samples:
            dataset_collection.insert_many(seed_samples)
            print(f"Seeded {len(seed_samples)} initial dataset catalogue entries.")

# Auto-seed on startup
try:
    init_dataset_seed()
except Exception as e:
    print(f"Note on dataset seed: {e}")

@router.get("/stats")
def get_dataset_stats():
    """Returns statistics for each of the 5 dance categories and overall completeness."""
    stats_by_form = {}
    total_samples = 0
    
    for form in SUPPORTED_DANCE_FORMS:
        if dataset_collection is not None:
            actual_count = dataset_collection.count_documents({"dance_form": form})
        else:
            actual_count = 0
        
        # We also calculate representative master dataset count (~500 per form)
        stats_by_form[form] = {
            "current_count": actual_count,
            "target_count": TARGET_PER_CATEGORY,
            "progress_percentage": round(min(100.0, (actual_count / TARGET_PER_CATEGORY) * 100), 1),
            "status": "Optimal" if actual_count >= 10 else "Growing"
        }
        total_samples += actual_count
    
    return {
        "total_samples": total_samples,
        "target_total": TARGET_PER_CATEGORY * len(SUPPORTED_DANCE_FORMS),
        "supported_forms_count": len(SUPPORTED_DANCE_FORMS),
        "categories": stats_by_form,
        "forms": SUPPORTED_DANCE_FORMS
    }

@router.get("/list")
def list_dataset_samples(
    category: Optional[str] = Query(None, description="Filter by classical dance form"),
    search: Optional[str] = Query(None, description="Search by title or posture"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Returns paginated dataset samples with optional category and search filters."""
    if dataset_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    query = {}
    if category and category in SUPPORTED_DANCE_FORMS:
        query["dance_form"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"posture_name": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    total = dataset_collection.count_documents(query)
    skip = (page - 1) * limit
    
    cursor = dataset_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    
    for doc in cursor:
        items.append({
            "id": str(doc["_id"]),
            "dance_form": doc.get("dance_form", "Bharatanatyam"),
            "title": doc.get("title", "Classical Dance Sample"),
            "dancer_name": doc.get("dancer_name", "Performer"),
            "posture_name": doc.get("posture_name", "N/A"),
            "file_path": doc.get("file_path", ""),
            "file_type": doc.get("file_type", "image/jpeg"),
            "file_size_bytes": doc.get("file_size_bytes", 0),
            "tags": doc.get("tags", []),
            "source": doc.get("source", "Natyaa AI"),
            "created_at": doc.get("created_at", "")
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.post("/upload")
async def upload_dataset_sample(
    dance_form: str = Form(...),
    title: str = Form("Classical Dance Sample"),
    dancer_name: str = Form("Performer"),
    posture_name: str = Form("Posture"),
    tags: str = Form(""),
    file: UploadFile = File(...)
):
    """Uploads a new sample to the dataset with metadata."""
    if dance_form not in SUPPORTED_DANCE_FORMS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid dance form. Must be one of: {', '.join(SUPPORTED_DANCE_FORMS)}"
        )
    
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".avi"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed_exts)}"
        )
    
    unique_filename = f"{dance_form.lower()}_{uuid.uuid4().hex[:8]}{ext}"
    save_path = os.path.join(DATASET_UPLOAD_DIR, unique_filename)
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = os.path.getsize(save_path)
    file_type = "video" if ext in [".mp4", ".mov", ".avi"] else "image"
    
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else [dance_form.lower()]
    
    doc = {
        "dance_form": dance_form,
        "title": title,
        "dancer_name": dancer_name,
        "posture_name": posture_name,
        "filename": unique_filename,
        "file_path": f"/uploads/dataset_samples/{unique_filename}",
        "file_type": f"{file_type}/{ext.replace('.', '')}",
        "file_size_bytes": file_size,
        "tags": tag_list,
        "source": "User Contribution",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    res = dataset_collection.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    
    return {
        "message": "Dataset sample uploaded and indexed successfully",
        "sample": doc
    }
