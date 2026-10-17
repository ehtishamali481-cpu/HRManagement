from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(String(50), nullable=False, default="Annual")
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    days_count = Column(Integer, nullable=False, default=1)
    reason = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending")
    is_urgent = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="leave_requests")
    employee = relationship("Employee", back_populates="leave_requests")
