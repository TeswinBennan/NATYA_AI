import platform
import os
from fastapi import APIRouter
from app.database.mongodb import check_mongo_health
from app.config import SUPPORTED_DANCE_FORMS, MODELS_DIR

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("/")
def get_health_status():
    mongo_status = check_mongo_health()
    
    # Check model artifacts presence
    models_present = {
        "dance_classifier_new.keras": os.path.exists(os.path.join(MODELS_DIR, "dance_classifier_new.keras")),
        "label_encoder_new.pkl": os.path.exists(os.path.join(MODELS_DIR, "label_encoder_new.pkl")),
        "scaler.pkl": os.path.exists(os.path.join(MODELS_DIR, "scaler.pkl")),
    }
    
    return {
        "status": "healthy",
        "platform": "Natyaa AI - Classical Dance Analysis",
        "version": "1.0.0",
        "system": {
            "os": platform.system(),
            "python_version": platform.python_version(),
        },
        "database": mongo_status,
        "models": models_present,
        "supported_dance_forms": SUPPORTED_DANCE_FORMS
    }
