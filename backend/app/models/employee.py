from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_code = Column(String(50), nullable=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(180), nullable=False)
    phone_number = Column(String(50), nullable=True)
    role_title = Column(String(100), nullable=False, default="Team Member")
    employment_type = Column(String(50), nullable=False, default="Full-Time")
    work_location = Column(String(100), nullable=False, default="HQ - San Francisco")
    reports_to = Column(String(120), nullable=True, default="Marcus Vance (Staff Architect)")
    base_salary = Column(String(50), nullable=True, default="115,000")
    currency = Column(String(20), nullable=False, default="USD ($)")
    assigned_role = Column(String(50), nullable=False, default="employee")
    avatar_url = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="active")
    start_date = Column(String(50), nullable=False, default="Today")
    onboarding_progress = Column(Integer, nullable=False, default=100)
    attendance_status = Column(String(50), nullable=False, default="present_office")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
