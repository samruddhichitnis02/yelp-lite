from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class UserDietary(Base):
    __tablename__ = "user_dietary"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    dietary_id = Column(Integer, ForeignKey("dietary_types.id", ondelete="CASCADE"), primary_key=True)