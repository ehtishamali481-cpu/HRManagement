from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel


class CompanyResponse(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    hq_location: str
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentAttendanceItem(BaseModel):
    id: int
    name: str
    total_staff: int
    present_staff: int
    rate_percent: int


class EmployeeItem(BaseModel):
    id: int
    employee_code: Optional[str] = None
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role_title: str
    department: str
    work_location: str = "HQ - San Francisco"
    employment_type: str = "Full-Time"
    reports_to: Optional[str] = None
    base_salary: Optional[str] = "115,000"
    currency: str = "USD ($)"
    assigned_role: str = "employee"
    start_date: str
    onboarding_progress: int
    status: str
    attendance_status: str
    avatar_url: Optional[str] = None


class LeaveApprovalItem(BaseModel):
    id: int
    employee_name: str
    employee_role: str
    department: str
    avatar_url: Optional[str] = None
    dates_text: str
    days_count: int
    leave_type: str
    reason: Optional[str] = None
    status: str
    is_urgent: bool


class CompanyEventItem(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    badge_date: str
    event_type: str


class CreateEmployeeRequest(BaseModel):
    full_name: str
    email: str
    phone_number: Optional[str] = None
    department_name: str
    role_title: str = "Team Member"
    employment_type: str = "Full-Time"
    work_location: str = "HQ - San Francisco"
    reports_to: Optional[str] = "Marcus Vance (Staff Architect)"
    base_salary: Optional[str] = "115,000"
    currency: str = "USD ($)"
    joining_date: str = "Today"
    assigned_role: str = "employee"
    avatar_url: Optional[str] = None


class TenantDashboardResponse(BaseModel):
    company: CompanyResponse
    user_name: str
    user_role: str
    user_avatar: Optional[str] = None
    total_employees: int
    new_hires_count: int
    recent_avatars: List[str]
    present_today: int
    attendance_rate: float
    on_leave_today: int
    leave_breakdown: dict
    pending_approvals: int
    pending_breakdown: dict
    departments: List[DepartmentAttendanceItem]
    attendance_stats: dict
    recent_onboarding: List[EmployeeItem]
    leave_approvals: List[LeaveApprovalItem]
    this_week_events: List[CompanyEventItem]


class DirectoryResponse(BaseModel):
    total_headcount: int
    in_onboarding: int
    on_leave_today: int
    departments_summary: Dict[str, int]
    employees: List[EmployeeItem]
    current_user_role: str
