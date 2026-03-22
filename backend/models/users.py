from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Auth / identity
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile fields
    profile_pic = Column(String(255), nullable=True)
    location = Column(String(120), nullable=True)
    phone = Column(String(20), nullable=True)
    about = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)
    languages = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())