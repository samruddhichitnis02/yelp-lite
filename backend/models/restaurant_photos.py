from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class RestaurantPhoto(Base):
    __tablename__ = "restaurant_photos"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_path = Column(String(255), nullable=False)
    uploaded_by = Column(String(20), nullable=True)  # "owner" or "user"
    created_at = Column(DateTime(timezone=True), server_default=func.now())