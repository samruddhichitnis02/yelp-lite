from pydantic import BaseModel, Field
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

class ReviewCreateRequest(BaseModel):
    restaurant_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None