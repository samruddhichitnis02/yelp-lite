from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    name = Column(String(200), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    city = Column(String(120), nullable=True, index=True)
    state = Column(String(60), nullable=True)
    zip_code = Column(String(20), nullable=True)

    cuisine = Column(String(120), nullable=True, index=True)
    price_range = Column(String(10), nullable=True)
    phone = Column(String(30), nullable=True)
    website = Column(String(255), nullable=True)
    hours_of_operation = Column(String(255), nullable=True)
    amenities = Column(Text, nullable=True)

    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)

    avg_rating = Column(Float, nullable=False, default=0.0)
    view_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())