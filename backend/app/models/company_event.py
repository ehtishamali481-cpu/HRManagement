from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class CompanyEvent(Base):
    __tablename__ = "company_events"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    subtitle = Column(String(150), nullable=True)
    badge_date = Column(String(50), nullable=False, default="TODAY")
    event_type = Column(String(50), nullable=False, default="holiday")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="events")
