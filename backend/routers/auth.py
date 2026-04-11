from mongodb import db as mongo_db
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from datetime import datetime, timedelta

from schemas.users import UserSignupRequest
from schemas.owner import OwnerSignupRequest, OwnerLoginRequest
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def create_session(token: str, role: str, user_id: str = None, owner_id: str = None):
    mongo_db.sessions.insert_one(
        {
            "token": token,
            "role": role,
            "user_id": user_id,
            "owner_id": owner_id,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=1),
        }
    )


@router.post("/user/signup")
def user_signup(payload: UserSignupRequest):
    existing = mongo_db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "profile_pic": None,
        "location": None,
        "phone": None,
        "about": None,
        "city": None,
        "state": None,
        "country": None,
        "languages": None,
        "gender": None,
        "created_at": datetime.utcnow(),
    }

    result = mongo_db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "role": "user"})
    create_session(token=token, role="user", user_id=user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "user",
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "profile_pic": user_doc["profile_pic"],
        },
    }


@router.post("/user/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = mongo_db.users.find_one({"email": form_data.username})

    if not user or "hashed_password" not in user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": "user"})
    create_session(token=token, role="user", user_id=user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "user",
        "user": {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "profile_pic": user.get("profile_pic"),
        },
    }


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


@router.post("/user/forgot-password")
def user_forgot_password(payload: ForgotPasswordRequest):
    user = mongo_db.users.find_one({"email": payload.email})
    if not user:
        return {
            "message": "If that email is registered, a reset token has been generated.",
            "reset_token": None,
        }

    reset_token = create_access_token(
        {"sub": str(user["_id"]), "role": "user", "purpose": "reset"},
        expires_minutes=15,
    )

    return {
        "message": "Reset token generated. Use it at /auth/user/reset-password within 15 minutes.",
        "reset_token": reset_token,
    }


@router.post("/user/reset-password")
def user_reset_password(payload: ResetPasswordRequest):
    try:
        data = decode_access_token(payload.token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if data.get("purpose") != "reset" or data.get("role") != "user":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = mongo_db.users.find_one({"_id": ObjectId(data["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    mongo_db.users.update_one(
        {"_id": ObjectId(data["sub"])},
        {"$set": {"hashed_password": hash_password(payload.new_password)}},
    )

    return {"message": "Password reset successfully. You can now log in."}


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