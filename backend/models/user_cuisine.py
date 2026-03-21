from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class UserCuisine(Base):
    __tablename__ = "user_cuisines"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    cuisine_id = Column(Integer, ForeignKey("cuisine_types.id", ondelete="CASCADE"), primary_key=True)