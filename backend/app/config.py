import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directories
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

# App Settings
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

# MongoDB Settings
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "natyaa_ai")

# Security Settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "natyaa_ai_classical_dance_super_secret_jwt_key_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))

# CORS
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = ["*"]

# Storage Paths
MODELS_DIR = os.path.join(BASE_DIR, "models")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
IMAGES_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "images")
VIDEOS_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "videos")
POSE_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "poses")
COMPARISON_UPLOAD_DIR = os.path.join(UPLOADS_DIR, "comparisons")
PROCESSED_VIDEOS_DIR = os.path.join(UPLOADS_DIR, "processed_videos")
DATASET_DIR = os.path.join(BASE_DIR, "dance_dataset")

# Email & Notification Settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "NATYA AI <notifications@natyaai.com>")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "NATYA AI")
SMTP_ENABLED = os.getenv("SMTP_ENABLED", "True").lower() in ("true", "1", "yes")
NOTIFICATIONS_DIR = os.path.join(UPLOADS_DIR, "notifications")

# Ensure directories exist
for directory in [
    MODELS_DIR,
    UPLOADS_DIR,
    IMAGES_UPLOAD_DIR,
    VIDEOS_UPLOAD_DIR,
    POSE_UPLOAD_DIR,
    COMPARISON_UPLOAD_DIR,
    PROCESSED_VIDEOS_DIR,
    DATASET_DIR,
    NOTIFICATIONS_DIR
]:
    os.makedirs(directory, exist_ok=True)


# Supported Classical Dance Forms
SUPPORTED_DANCE_FORMS = [
    "Bharatanatyam",
    "Kathakali",
    "Kuchipudi",
    "Kathak",
    "Mohiniyattam"
]

