import re
from typing import Optional
from pydantic import BaseModel, field_validator


class SignupRequest(BaseModel):
    company_name: str
    full_name: str
    email: str
    password: str

    @field_validator("company_name")
    def validate_company(cls, v: str) -> str:
        val = v.strip()
        if len(val) < 2:
            raise ValueError("Company name must be at least 2 characters long.")
        return val

    @field_validator("full_name")
    def validate_name(cls, v: str) -> str:
        val = v.strip()
        if len(val) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return val

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        val = v.strip().lower()
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", val):
            raise ValueError("Please provide a valid email address.")
        return val

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter.")
        return v


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

    @field_validator("otp")
    def validate_otp(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) != 6 or not clean.isdigit():
            raise ValueError("OTP must be exactly 6 digits.")
        return clean


class ResendOtpRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

    @field_validator("otp")
    def validate_otp(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) != 6 or not clean.isdigit():
            raise ValueError("OTP must be exactly 6 digits.")
        return clean

    @field_validator("new_password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter.")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    company_id: int
    company_name: str
    is_verified: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
