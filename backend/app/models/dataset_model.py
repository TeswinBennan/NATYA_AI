from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DatasetSampleCreate(BaseModel):
    dance_form: str
    title: Optional[str] = "Classical Dance Sample"
    dancer_name: Optional[str] = "Traditional Performer"
    posture_name: Optional[str] = "Adavu / Mudra"
    tags: Optional[List[str]] = []
    source: Optional[str] = "Natyaa AI Dataset Archive"

class DatasetSampleResponse(BaseModel):
    id: str
    dance_form: str
    title: str
    file_path: str
    file_type: str
    file_size_bytes: int
    posture_name: str
    tags: List[str]
    created_at: str
