from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks, Request
from bson import ObjectId
from app.models.user_model import UserRegister, UserLogin, UserProfileUpdate
from app.database.mongodb import users_collection
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, get_current_user
from app.utils.email_service import send_welcome_email, send_login_alert_email

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

def format_user_response(user: dict) -> dict:
    """Format MongoDB user document into clean response dictionary."""
    return {
        "id": str(user.get("_id", "")),
        "email": user.get("email", ""),
        "full_name": user.get("full_name", ""),
        "dance_form_interest": user.get("dance_form_interest", "Bharatanatyam"),
        "experience_level": user.get("experience_level", "Beginner"),
        "role": user.get("role", "dancer"),
        "bio": user.get("bio", ""),
        "created_at": user.get("created_at", datetime.now(timezone.utc).isoformat())
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, background_tasks: BackgroundTasks):
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    # Check if user already exists
    existing = users_collection.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    now = datetime.now(timezone.utc).isoformat()
    new_user_dict = {
        "email": user_in.email.lower(),
        "password": hash_password(user_in.password),
        "full_name": user_in.full_name,
        "dance_form_interest": user_in.dance_form_interest,
        "experience_level": user_in.experience_level,
        "role": user_in.role or "dancer",
        "bio": "",
        "created_at": now,
        "updated_at": now
    }
    
    result = users_collection.insert_one(new_user_dict)
    new_user_dict["_id"] = result.inserted_id
    
    token = create_access_token({"email": new_user_dict["email"], "role": new_user_dict["role"]})
    
    # Trigger Welcome & Onboarding Email in Background Task
    background_tasks.add_task(
        send_welcome_email,
        email=new_user_dict["email"],
        full_name=new_user_dict["full_name"],
        dance_form_interest=new_user_dict["dance_form_interest"],
        experience_level=new_user_dict["experience_level"]
    )
    
    return {
        "message": "User registered successfully",
        "token": token,
        "email_notification": "Welcome email dispatched",
        "user": format_user_response(new_user_dict)
    }

@router.post("/login")
async def login(credentials: UserLogin, request: Request, background_tasks: BackgroundTasks):
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    user = users_collection.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token({"email": user["email"], "role": user.get("role", "dancer")})
    
    # Extract client IP and user-agent for security alert
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Web Browser")
    
    # Trigger Security Sign-in Alert Email in Background Task
    background_tasks.add_task(
        send_login_alert_email,
        email=user["email"],
        full_name=user.get("full_name", ""),
        client_ip=client_ip,
        user_agent=user_agent
    )
    
    return {
        "message": "Login successful",
        "token": token,
        "email_notification": "Security sign-in alert dispatched",
        "user": format_user_response(user)
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Returns currently authenticated user profile."""
    return format_user_response(current_user)

@router.put("/profile")
async def update_profile(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    if not update_data:
        return format_user_response(current_user)
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    
    updated_user = users_collection.find_one({"_id": ObjectId(current_user["id"])})
    return {
        "message": "Profile updated successfully",
        "user": format_user_response(updated_user)
    }
