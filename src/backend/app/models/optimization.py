from typing import Optional
from pydantic import BaseModel, Field


class OptimizationRequest(BaseModel):
    prioritize_express: bool = True
    prioritize_priority_vessels: bool = True
    allow_berth_reassignment: bool = True
    max_cranes_per_vessel: int = 4
    min_cranes_per_vessel: int = 2


class BerthAssignment(BaseModel):
    vessel_id: str
    vessel_name: str
    carrier: str
    original_berth: Optional[str] = None
    optimized_berth: str
    allocated_cranes: list[str] = Field(default_factory=list)
    start_time: str
    end_time: str
    turnaround_hours: float
    waiting_time_saved_hours: float
    conflict_resolved: bool
    draft_clearance_m: float


class OptimizationResult(BaseModel):
    total_vessels_optimized: int
    average_waiting_time_reduction_pct: float
    total_delay_hours_prevented: float
    berth_utilization_improvement_pct: float
    assignments: list[BerthAssignment]
    unresolved_conflicts: list[str] = Field(default_factory=list)
    summary_notes: str
