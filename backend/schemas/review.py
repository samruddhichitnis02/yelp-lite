from pydantic import BaseModel
from datetime import datetime


class ReviewPublic(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True