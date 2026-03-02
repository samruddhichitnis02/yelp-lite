from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    # Who owns/manages it (Owner features in the PDF)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=True)

    # Core restaurant info (for search + details)
    name = Column(String(200), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    city = Column(String(120), nullable=True, index=True)
    state = Column(String(60), nullable=True)
    zip_code = Column(String(20), nullable=True)

    cuisine = Column(String(120), nullable=True, index=True)
    price_range = Column(String(10), nullable=True)  # e.g. "$", "$$", "$$$"
    phone = Column(String(30), nullable=True)
    website = Column(String(255), nullable=True)

    description = Column(Text, nullable=True)

    # Image (store filename/path like "uploads/rest_123.jpg")
    image = Column(String(255), nullable=True)

    # Convenience fields (can be computed later, but safe to store)
    avg_rating = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())