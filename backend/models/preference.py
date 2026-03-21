from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

# class Preference(Base):
#     __tablename__ = "preferences"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

#     # Store one preference per row (simple + flexible)
#     # Example values: "Italian", "Vegan", "Sushi", "Gluten-Free"
#     preference = Column(String(120), nullable=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())

#     # Prevent duplicates for same user
#     __table_args__ = (
#         UniqueConstraint("user_id", "preference", name="uq_preferences_user_preference"),
    # )

class Preference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    price_range = Column(String(10), nullable=True)
    sort_preference = Column(String(50), nullable=True)
    preferred_location = Column(String(255), nullable=True)
    search_radius = Column(Integer, nullable=True)