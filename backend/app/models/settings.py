from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from database import Base


class WorkspaceSetting(Base):
    __tablename__ = "workspace_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    legal_name = Column(String(180), default="Acme Global Technologies Inc.", nullable=False)
    domain = Column(String(120), default="acmeglobal.com", nullable=False)
    hq_address = Column(String(255), default="San Francisco, CA (HQ Tower - 500 Howard St)", nullable=False)
    geofence_lat = Column(String(50), default="37.7897° N", nullable=False)
    geofence_lng = Column(String(50), default="122.3969° W", nullable=False)
    geofence_radius = Column(String(50), default="500m", nullable=False)
    timezone = Column(String(100), default="(GMT-08:00) Pacific Time (US & Canada)", nullable=False)
    currency = Column(String(80), default="USD ($) - United States Dollar", nullable=False)
    fiscal_year = Column(String(120), default="January 01 - December 31 (Calendar Year)", nullable=False)
    annual_pto_rate = Column(String(120), default="1.75 days per month (21 days/year equivalent)", nullable=False)
    max_carryover = Column(String(120), default="5.0 accrued days", nullable=False)
    geofence_enforced = Column(Boolean, default=True, nullable=False)
    medical_cert_required = Column(Boolean, default=True, nullable=False)
    sso_enforced = Column(Boolean, default=True, nullable=False)
    session_timeout = Column(String(80), default="8 hours of inactivity", nullable=False)
    two_factor_mandatory = Column(Boolean, default=True, nullable=False)
    two_factor_grace = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class WorkspaceAuditLog(Base):
    __tablename__ = "workspace_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_name = Column(String(120), nullable=False)
    action_text = Column(Text, nullable=False)
    tag_label = Column(String(80), nullable=False)
    tag_type = Column(String(50), default="info", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class WorkspaceIntegration(Base):
    __tablename__ = "workspace_integrations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    subtext = Column(String(180), nullable=False)
    status = Column(String(50), default="Connected", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class WorkspaceAdmin(Base):
    __tablename__ = "workspace_admins"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name = Column(String(120), nullable=False)
    role_label = Column(String(120), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    is_current_user = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
