from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, description="Full name of the dancer/user")
    dance_form_interest: Optional[str] = "Bharatanatyam"
    experience_level: Optional[str] = "Beginner" # Beginner, Intermediate, Advanced, Professional
    role: Optional[str] = "dancer" # dancer, instructor, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    dance_form_interest: Optional[str] = None
    experience_level: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    dance_form_interest: str
    experience_level: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
