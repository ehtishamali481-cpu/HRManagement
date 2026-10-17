import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import (
    SignupRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
)
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.email_service import generate_otp, send_otp_email, send_forgot_password_email
from app.routes.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def generate_company_slug(name: str, db: Session) -> str:
    base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip()).strip("-").lower()
    if not base_slug:
        base_slug = "company"
    
    slug = base_slug
    counter = 1
    while db.query(Company).filter(Company.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this work email already exists. Please sign in.",
            )
        existing_user.full_name = payload.full_name.strip()
        existing_user.hashed_password = hash_password(payload.password)
        otp = generate_otp()
        existing_user.otp_code = otp
        existing_user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        db.commit()
        send_otp_email(normalized_email, otp, existing_user.full_name)
        return {
            "message": "Verification code sent to your work email.",
            "email": normalized_email,
            "dev_otp": otp,
        }

    slug = generate_company_slug(payload.company_name, db)
    new_company = Company(
        name=payload.company_name.strip(),
        slug=slug,
        plan="Enterprise Tier",
    )
    db.add(new_company)
    db.flush()

    otp = generate_otp()
    otp_expires_at = datetime.utcnow() + timedelta(minutes=10)

    new_user = User(
        company_id=new_company.id,
        full_name=payload.full_name.strip(),
        email=normalized_email,
        hashed_password=hash_password(payload.password),
        role="owner",
        is_verified=False,
        otp_code=otp,
        otp_expires_at=otp_expires_at,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    send_otp_email(normalized_email, otp, new_user.full_name)

    return {
        "message": "Account registered. Verification code sent to your work email.",
        "email": normalized_email,
        "dev_otp": otp,
    }


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found with this email address.",
        )

    if user.is_verified:
        token = create_access_token(
            data={"sub": str(user.id), "company_id": user.company_id, "role": user.role}
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "company_id": user.company_id,
                "company_name": user.company.name if user.company else "My Organization",
                "is_verified": True,
            },
        }

    if not user.otp_code or user.otp_code != payload.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code. Please check and try again.",
        )

    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)

    token = create_access_token(
        data={"sub": str(user.id), "company_id": user.company_id, "role": user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": user.company.name if user.company else "My Organization",
            "is_verified": True,
        },
    }


@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    if user.is_verified:
        return {"message": "Account is already verified. Please sign in."}

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_otp_email(normalized_email, otp, user.full_name)

    return {
        "message": "New verification code has been sent.",
        "email": normalized_email,
        "dev_otp": otp,
    }


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid work email address or password.",
        )

    if not user.is_verified:
        otp = generate_otp()
        user.otp_code = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        db.commit()
        send_otp_email(normalized_email, otp, user.full_name)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Your work email is not verified yet. A verification code has been dispatched.",
                "requires_verification": True,
                "email": normalized_email,
                "dev_otp": otp,
            },
        )

    expire_delta = timedelta(days=30) if payload.remember_me else timedelta(days=1)
    token = create_access_token(
        data={"sub": str(user.id), "company_id": user.company_id, "role": user.role},
        expires_delta=expire_delta,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": user.company.name if user.company else "My Organization",
            "is_verified": user.is_verified,
        },
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "company_id": current_user.company_id,
        "company_name": current_user.company.name if current_user.company else "My Organization",
        "is_verified": current_user.is_verified,
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this work email.",
        )

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_forgot_password_email(normalized_email, otp, user.full_name)

    return {
        "message": "Password reset code sent to your email address.",
        "email": normalized_email,
        "dev_otp": otp,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email.",
        )

    if not user.otp_code or user.otp_code != payload.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit reset verification code.",
        )

    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset verification code has expired. Please request a new one.",
        )

    user.hashed_password = hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password has been successfully reset. Please sign in."}

