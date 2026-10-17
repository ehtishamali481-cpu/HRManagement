from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class PayrollCycleItem(BaseModel):
    id: int
    period_text: str
    period_start: str
    period_end: str
    pay_date: str
    headcount: int
    gross_total: str
    net_disbursement: str
    status: str


class ExpenseClaimItem(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    employee_role: str
    department: str
    avatar_url: Optional[str] = None
    amount: str
    category: str
    description: str
    status: str


class ChecklistItem(BaseModel):
    id: int
    item_key: str
    title: str
    subtitle: str
    is_completed: bool


class DepartmentSalaryItem(BaseModel):
    name: str
    headcount: int
    monthly_salary: str
    percent: int


class PayrollSummaryResponse(BaseModel):
    total_net_payroll: str
    net_payroll_change: str
    disbursement_status: str
    next_pay_date: str
    taxes_withheld: str
    expense_claims_count: int
    expense_claims_subtext: str
    total_monthly_allocated: str
    cycles: List[PayrollCycleItem]
    department_breakdown: List[DepartmentSalaryItem]
    checklist: List[ChecklistItem]
    claims: List[ExpenseClaimItem]


class RunPayrollInput(BaseModel):
    period_start: str
    period_end: str
    pay_date: str


class ToggleChecklistInput(BaseModel):
    item_id: int
    is_completed: bool


class CreateClaimInput(BaseModel):
    employee_id: Optional[int] = None
    amount: str
    category: str
    description: str
