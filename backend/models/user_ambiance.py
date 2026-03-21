from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class UserAmbiance(Base):
    __tablename__ = "user_ambiance"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    ambiance_id = Column(Integer, ForeignKey("ambiance_types.id", ondelete="CASCADE"), primary_key=True)