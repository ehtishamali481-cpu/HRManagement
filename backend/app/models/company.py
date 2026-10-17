from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    plan = Column(String(50), default="Enterprise Tier", nullable=False)
    hq_location = Column(String(150), default="San Francisco, CA", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="company", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="company", cascade="all, delete-orphan")
    events = relationship("CompanyEvent", back_populates="company", cascade="all, delete-orphan")
