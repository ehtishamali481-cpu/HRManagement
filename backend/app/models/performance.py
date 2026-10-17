from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from database import Base


class ReviewCycle(Base):
    __tablename__ = "review_cycles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_name = Column(String(180), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    days_left = Column(Integer, default=14, nullable=False)
    peer_reviews_pct = Column(Integer, default=94, nullable=False)
    upward_feedback_pct = Column(Integer, default=100, nullable=False)
    manager_signoff_pct = Column(Integer, default=76, nullable=False)
    overdue_note = Column(String(255), default="Late submission actions open for 11 Engineering.", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class PromotionCandidate(Base):
    __tablename__ = "promotion_candidates"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_name = Column(String(120), nullable=False)
    current_role = Column(String(120), nullable=False)
    proposed_role = Column(String(120), nullable=False)
    department = Column(String(100), nullable=False)
    rating = Column(Float, default=4.8, nullable=False)
    status = Column(String(50), default="queued", nullable=False)
    avatar_url = Column(String(255), nullable=True)
    manager_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class DepartmentPerformance(Base):
    __tablename__ = "department_performances"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    department_name = Column(String(100), nullable=False)
    okr_progress = Column(Integer, default=85, nullable=False)
    avg_rating = Column(Float, default=4.5, nullable=False)
    promo_ready_count = Column(Integer, default=10, nullable=False)
    perf_vector = Column(String(50), default="+3.4%", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SkillMatrixMetric(Base):
    __tablename__ = "skill_matrix_metrics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(150), nullable=False)
    level_label = Column(String(80), nullable=False)
    score_percent = Column(Integer, default=85, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
