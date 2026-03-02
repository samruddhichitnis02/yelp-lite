from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Auth / identity
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile fields (PDF requires profile + profile pic)
    profile_pic = Column(String(255), nullable=True)  # store filename or URL path like "uploads/xyz.jpg"
    location = Column(String(120), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())