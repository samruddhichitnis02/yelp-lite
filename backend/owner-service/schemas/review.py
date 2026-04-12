from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReviewPublic(BaseModel):
    id: str
    user_id: Optional[str]
    restaurant_id: Optional[str]
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCreateRequest(BaseModel):
    restaurant_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None

class ReviewUpdateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None