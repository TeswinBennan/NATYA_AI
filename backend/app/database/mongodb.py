import sys
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import MONGO_URL, MONGO_DB_NAME

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=3000)
    # Check connection
    client.admin.command('ping')
    db = client[MONGO_DB_NAME]
    
    # Collections
    users_collection = db["users"]
    sessions_collection = db["sessions"]
    dataset_collection = db["dataset"]
    analysis_collection = db["analysis_history"]
    digital_twin_collection = db["digital_twins"]
    
    # Ensure indexes
    try:
        users_collection.create_index([("email", ASCENDING)], unique=True)
        analysis_collection.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
        dataset_collection.create_index([("dance_form", ASCENDING)])
    except Exception as idx_err:
        print(f"Index creation note: {idx_err}")
        
    print(f"Connected to MongoDB database: {MONGO_DB_NAME}")

except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"Warning: Could not connect to MongoDB at {MONGO_URL}. Error: {e}", file=sys.stderr)
    client = None
    db = None
    users_collection = None
    sessions_collection = None
    dataset_collection = None
    analysis_collection = None
    digital_twin_collection = None


def check_mongo_health() -> dict:
    """Returns the health status of the MongoDB database."""
    if client is None:
        return {"status": "disconnected", "error": "MongoClient not initialized"}
    try:
        client.admin.command('ping')
        return {
            "status": "connected",
            "database": MONGO_DB_NAME,
            "collections": db.list_collection_names() if db is not None else []
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
