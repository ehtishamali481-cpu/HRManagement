from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    check_in = Column(String(50), nullable=True)
    check_out = Column(String(50), nullable=True)
    total_hours = Column(String(50), nullable=True, default="8h 00m")
    status = Column(String(50), nullable=False, default="on_time")
    location = Column(String(100), nullable=False, default="HQ - San Francisco")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", backref="attendance_records")
    employee = relationship("Employee", backref="attendance_records")
