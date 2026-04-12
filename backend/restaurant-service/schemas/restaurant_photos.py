from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class RestaurantPhotoPublic(BaseModel):
    id: str
    restaurant_id: Optional[str]
    photo_path: str
    uploaded_by: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RestaurantPhotosResponse(BaseModel):
    photos: List[RestaurantPhotoPublic]