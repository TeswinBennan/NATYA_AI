from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS
from app.database.mongodb import users_collection
from bson import ObjectId

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Encodes JWT access token with payload and expiration."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> dict:
    """FastAPI dependency to extract and authenticate the current user from Bearer token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload["email"]
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    user = users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Format user id for clean json
    user["id"] = str(user["_id"])
    return user


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency verifying user is active and has valid status."""
    return current_user


async def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[dict]:
    """Dependency to extract user if token is provided, returns None if not authenticated."""
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload or "email" not in payload:
            return None
        if users_collection is None:
            return None
        user = users_collection.find_one({"email": payload["email"]})
        if user:
            user["id"] = str(user["_id"])
            return user
        return None
    except Exception:
        return None

