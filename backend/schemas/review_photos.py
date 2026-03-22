from pydantic import BaseModel
from datetime import datetime
from typing import List

class ReviewPhotoPublic(BaseModel):
    id: int
    review_id: int
    photo_path: str
    created_at: datetime

    class Config:
        from_attributes = True