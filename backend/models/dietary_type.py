from sqlalchemy import Column, Integer, String
from database import Base


class DietaryType(Base):
    __tablename__ = "dietary_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)