from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

class Favourite(Base):
    __tablename__ = "favourites"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Prevent same user from favouriting same restaurant twice
    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", name="uq_favourites_user_restaurant"),
    )