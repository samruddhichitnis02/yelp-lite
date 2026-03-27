from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.users import User
from models.owner import Owner

from fastapi.security import OAuth2PasswordRequestForm
from schemas.users import UserSignupRequest, UserLoginRequest
from schemas.owner import OwnerSignupRequest, OwnerLoginRequest

from services.auth_service import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Shared request schemas for forgot/reset ──────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/user/signup")
def user_signup(payload: UserSignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": "user"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "user",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_pic": user.profile_pic,
        },
    }


@router.post("/user/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 uses "username" field; we treat it as email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": "user"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "user",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_pic": user.profile_pic,
        },
    }


@router.post("/owner/signup")
def owner_signup(payload: OwnerSignupRequest, db: Session = Depends(get_db)):
    existing = db.query(Owner).filter(Owner.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    owner = Owner(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        location=payload.location,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    token = create_access_token({"sub": str(owner.id), "role": "owner"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "owner",
        "owner": {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email,
            "location": owner.location,
        },
    }


@router.post("/owner/login")
def owner_login(payload: OwnerLoginRequest, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.email == payload.email).first()
    if not owner or not verify_password(payload.password, owner.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(owner.id), "role": "owner"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "owner",
        "owner": {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email,
        },
    }

# ── Forgot Password (generates a short-lived reset token) ────────────────────

@router.post("/user/forgot-password")
def user_forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If that email is registered, a reset token has been generated.", "reset_token": None}

    reset_token = create_access_token(
        {"sub": str(user.id), "role": "user", "purpose": "reset"},
        expires_minutes=15,
    )
    return {
        "message": "Reset token generated. Use it at /auth/user/reset-password within 15 minutes.",
        "reset_token": reset_token,
    }


@router.post("/user/reset-password")
def user_reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        data = decode_access_token(payload.token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if data.get("purpose") != "reset" or data.get("role") != "user":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now log in."}


# ── Forgot Password — Owner ──────────────────────────────────────────────────

@router.post("/owner/forgot-password")
def owner_forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.email == payload.email).first()
    if not owner:
        return {"message": "If that email is registered, a reset token has been generated.", "reset_token": None}

    reset_token = create_access_token(
        {"sub": str(owner.id), "role": "owner", "purpose": "reset"},
        expires_minutes=15,
    )
    return {
        "message": "Reset token generated. Use it at /auth/owner/reset-password within 15 minutes.",
        "reset_token": reset_token,
    }


@router.post("/owner/reset-password")
def owner_reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        data = decode_access_token(payload.token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if data.get("purpose") != "reset" or data.get("role") != "owner":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    owner = db.query(Owner).filter(Owner.id == int(data["sub"])).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found.")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    owner.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now log in."}