from pydantic import BaseModel
from datetime import datetime
from typing import List

class RestaurantPhotoPublic(BaseModel):
    id: int
    restaurant_id: int
    photo_path: str
    uploaded_by: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class RestaurantPhotosResponse(BaseModel):
    photos: List[RestaurantPhotoPublic]