from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class AttendanceRecordItem(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    employee_code: str
    employee_role: str
    department: str
    avatar_url: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    total_hours: Optional[str] = "8h 00m"
    status: str
    location: str
    date: str


class LeaveRequestDetailItem(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    employee_role: str
    department: str
    avatar_url: Optional[str] = None
    leave_type: str
    start_date: str
    end_date: str
    days_count: int
    reason: Optional[str] = None
    status: str
    is_urgent: bool


class CreateLeaveRequestInput(BaseModel):
    employee_id: Optional[int] = None
    leave_type: str = "Annual"
    start_date: str
    end_date: str
    days_count: int = 1
    reason: Optional[str] = None
    is_urgent: bool = False


class ClockActionInput(BaseModel):
    employee_id: int
    action: str = "clock_in"
    location: Optional[str] = "HQ - San Francisco"


class AttendanceSummaryResponse(BaseModel):
    average_check_in: str
    late_arrivals_today: int
    remote_sessions_count: int
    on_leave_count: int
    total_records: int
    leave_policy_balance: Dict[str, Any]
    records: List[AttendanceRecordItem]
    leave_requests: List[LeaveRequestDetailItem]
