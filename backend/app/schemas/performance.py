from typing import List, Optional
from pydantic import BaseModel


class ReviewCycleItem(BaseModel):
    id: int
    cycle_name: str
    status: str
    start_date: str
    end_date: str
    days_left: int
    peer_reviews_pct: int
    upward_feedback_pct: int
    manager_signoff_pct: int
    overdue_note: str


class PromotionCandidateItem(BaseModel):
    id: int
    employee_id: Optional[int] = None
    employee_name: str
    current_role: str
    proposed_role: str
    department: str
    rating: float
    status: str
    avatar_url: Optional[str] = None
    manager_feedback: Optional[str] = None


class DepartmentPerformanceItem(BaseModel):
    id: int
    department_name: str
    staff_count: int
    okr_progress: int
    avg_rating: float
    promo_ready_count: int
    perf_vector: str


class SkillMatrixItem(BaseModel):
    id: int
    skill_name: str
    level_label: str
    score_percent: int


class PerformanceRatingTier(BaseModel):
    tier_name: str
    staff_count: int
    percentage: int
    rating_label: str
    description: str


class PerformanceSummaryResponse(BaseModel):
    company_okr_attainment: float
    okr_change_pct: str
    reviews_completed_count: int
    total_reviews_target: int
    reviews_completed_pct: int
    reviews_pending_count: int
    promotion_candidates_count: int
    at_risk_flags_count: int
    flight_risk_label: str
    retention_index: str
    talent_bench_count: int
    successors_ready_pct: int
    strategic_recommendation: str
    active_cycle: Optional[ReviewCycleItem] = None
    rating_tiers: List[PerformanceRatingTier]
    department_performances: List[DepartmentPerformanceItem]
    promotion_candidates: List[PromotionCandidateItem]
    skill_matrix: List[SkillMatrixItem]


class LaunchReviewCycleInput(BaseModel):
    cycle_name: str
    start_date: str
    end_date: str


class NominatePromotionInput(BaseModel):
    employee_name: str
    current_role: str
    proposed_role: str
    department: str
    rating: float = 4.8
