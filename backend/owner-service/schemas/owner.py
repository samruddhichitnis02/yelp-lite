from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class OwnerSignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    location: str = Field(..., min_length=1, max_length=150)


class OwnerLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class OwnerPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    location: Optional[str] = None

    class Config:
        from_attributes = True