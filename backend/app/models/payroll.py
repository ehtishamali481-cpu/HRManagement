from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class PayrollCycle(Base):
    __tablename__ = "payroll_cycles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    period_start = Column(String(50), nullable=False)
    period_end = Column(String(50), nullable=False)
    pay_date = Column(String(50), nullable=False)
    headcount = Column(Integer, nullable=False, default=1)
    gross_total = Column(String(50), nullable=False, default="$742,600")
    net_disbursement = Column(String(50), nullable=False, default="Pending Payout")
    status = Column(String(50), nullable=False, default="ready")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", backref="payroll_cycles")


class ExpenseClaim(Base):
    __tablename__ = "expense_claims"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(String(50), nullable=False, default="$180.00")
    category = Column(String(100), nullable=False, default="Engineering")
    description = Column(String(255), nullable=False, default="Software Dev Subscription")
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", backref="expense_claims")
    employee = relationship("Employee", backref="expense_claims")


class PayrollChecklistItem(Base):
    __tablename__ = "payroll_checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    item_key = Column(String(50), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    subtitle = Column(String(150), nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", backref="payroll_checklists")
