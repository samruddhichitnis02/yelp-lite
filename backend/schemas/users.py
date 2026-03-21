from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ---------- Requests ----------

class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    location: Optional[str] = Field(default=None, max_length=120)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

# ---------- Responses ----------

class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    location: Optional[str] = None
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True  # Pydantic v2 reads SQLAlchemy objects

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "user"
    user: UserPublic