import os
import sys

# Add current dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import MONGO_URL, MONGO_DB_NAME, SUPPORTED_DANCE_FORMS
from app.database.mongodb import check_mongo_health
from fastapi.testclient import TestClient
from main import app

def run_tests():
    print("=" * 60)
    print("STAGE 1 FOUNDATION TEST: NATYAA AI BACKEND")
    print("=" * 60)
    
    print(f"\n1. Checking MongoDB Connection to {MONGO_URL} (db: {MONGO_DB_NAME})...")
    health = check_mongo_health()
    print(f"MongoDB Status: {health.get('status')}")
    assert health.get("status") == "connected", f"MongoDB connection failed: {health}"
    print("   [PASS] MongoDB is healthy and reachable!")
    
    print("\n2. Checking Supported Dance Forms...")
    assert len(SUPPORTED_DANCE_FORMS) == 5
    print(f"   Forms: {', '.join(SUPPORTED_DANCE_FORMS)}")
    print("   [PASS] All 5 classical forms configured!")
    
    print("\n3. Testing FastAPI Endpoints via TestClient...")
    client = TestClient(app)
    
    root_res = client.get("/")
    assert root_res.status_code == 200, f"Root returned {root_res.status_code}"
    print(f"   GET / -> {root_res.json()}")
    
    health_res = client.get("/api/health/")
    assert health_res.status_code == 200, f"Health returned {health_res.status_code}"
    print(f"   GET /api/health/ -> {health_res.json()}")
    print("   [PASS] FastAPI & Health check operational!")
    
    print("\n" + "=" * 60)
    print("STAGE 1 BACKEND VERIFICATION SUCCESSFUL!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
