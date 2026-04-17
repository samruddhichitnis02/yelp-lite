from mongodb import db as mongo_db
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta

from schemas.owner import OwnerSignupRequest, OwnerLoginRequest
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["owner-auth"])


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def create_session(token: str, role: str, owner_id: str = None):
    mongo_db.sessions.insert_one(
        {
            "token": token,
            "role": role,
            "owner_id": owner_id,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=1),
        }
    )


@router.post("/owner/signup")
def owner_signup(payload: OwnerSignupRequest):
    existing = mongo_db.owners.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    owner_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "location": payload.location,
        "created_at": datetime.utcnow(),
    }

    result = mongo_db.owners.insert_one(owner_doc)
    owner_id = str(result.inserted_id)

    token = create_access_token({"sub": owner_id, "role": "owner"})
    create_session(token=token, role="owner", owner_id=owner_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "owner",
        "owner": {
            "id": owner_id,
            "name": owner_doc["name"],
            "email": owner_doc["email"],
            "location": owner_doc["location"],
        },
    }


@router.post("/owner/login")
def owner_login(payload: OwnerLoginRequest):
    owner = mongo_db.owners.find_one({"email": payload.email})

    if not owner or "hashed_password" not in owner or not verify_password(payload.password, owner["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    owner_id = str(owner["_id"])
    token = create_access_token({"sub": owner_id, "role": "owner"})
    create_session(token=token, role="owner", owner_id=owner_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "owner",
        "owner": {
            "id": owner_id,
            "name": owner.get("name"),
            "email": owner.get("email"),
            "location": owner.get("location"),
        },
    }


@router.post("/owner/forgot-password")
def owner_forgot_password(payload: ForgotPasswordRequest):
    owner = mongo_db.owners.find_one({"email": payload.email})
    if not owner:
        return {
            "message": "If that email is registered, a reset token has been generated.",
            "reset_token": None,
        }

    reset_token = create_access_token(
        {"sub": str(owner["_id"]), "role": "owner", "purpose": "reset"},
        expires_minutes=15,
    )

    return {
        "message": "Reset token generated. Use it at /auth/owner/reset-password within 15 minutes.",
        "reset_token": reset_token,
    }


@router.post("/owner/reset-password")
def owner_reset_password(payload: ResetPasswordRequest):
    try:
        data = decode_access_token(payload.token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if data.get("purpose") != "reset" or data.get("role") != "owner":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    owner = mongo_db.owners.find_one({"_id": ObjectId(data["sub"])})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found.")

    mongo_db.owners.update_one(
        {"_id": ObjectId(data["sub"])},
        {"$set": {"hashed_password": hash_password(payload.new_password)}},
    )

    return {"message": "Password reset successfully. You can now log in."}