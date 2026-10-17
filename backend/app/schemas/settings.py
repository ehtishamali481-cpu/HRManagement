from typing import List, Optional
from pydantic import BaseModel


class WorkspaceSettingResponse(BaseModel):
    id: int
    legal_name: str
    domain: str
    hq_address: str
    geofence_lat: str
    geofence_lng: str
    geofence_radius: str
    timezone: str
    currency: str
    fiscal_year: str
    annual_pto_rate: str
    max_carryover: str
    geofence_enforced: bool
    medical_cert_required: bool
    sso_enforced: bool
    session_timeout: str
    two_factor_mandatory: bool
    two_factor_grace: bool
    office_staff_count: int
    total_staff_count: int


class WorkspaceAuditLogItem(BaseModel):
    id: int
    actor_name: str
    action_text: str
    tag_label: str
    tag_type: str
    created_at: str


class WorkspaceIntegrationItem(BaseModel):
    id: int
    name: str
    subtext: str
    status: str


class WorkspaceAdminItem(BaseModel):
    id: int
    full_name: str
    role_label: str
    avatar_url: Optional[str] = None
    is_current_user: bool = False


class WorkspaceSettingsSummaryResponse(BaseModel):
    settings: WorkspaceSettingResponse
    admins: List[WorkspaceAdminItem]
    audit_logs: List[WorkspaceAuditLogItem]
    integrations: List[WorkspaceIntegrationItem]


class UpdateWorkspaceSettingsInput(BaseModel):
    legal_name: Optional[str] = None
    domain: Optional[str] = None
    hq_address: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    fiscal_year: Optional[str] = None
    annual_pto_rate: Optional[str] = None
    max_carryover: Optional[str] = None
    geofence_enforced: Optional[bool] = None
    medical_cert_required: Optional[bool] = None
    sso_enforced: Optional[bool] = None
    session_timeout: Optional[str] = None
    two_factor_mandatory: Optional[bool] = None
    two_factor_grace: Optional[bool] = None


class InviteAdminInput(BaseModel):
    full_name: str
    role_label: str
    avatar_url: Optional[str] = None
