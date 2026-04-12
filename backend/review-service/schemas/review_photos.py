from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ReviewPhotoPublic(BaseModel):
    id: str
    review_id: Optional[str]
    photo_path: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True