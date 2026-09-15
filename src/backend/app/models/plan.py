from pydantic import BaseModel, Field


class ShiftTask(BaseModel):
    id: str
    time_window: str
    vessel_name: str
    berth_id: str
    action_type: str  # "Berthing", "Discharge", "Loading", "Unberthing", "Crane Reassignment"
    crane_gangs: list[str] = Field(default_factory=list)
    target_moves: int
    status: str = "scheduled"


class ShiftPlan(BaseModel):
    shift_id: str
    day_label: str
    shift_label: str
    supervisor: str
    expected_moves_teu: int
    risk_level: str
    berth_occupancy_pct: float
    yard_gate_capacity_pct: float
    tasks: list[ShiftTask] = Field(default_factory=list)
    critical_checklist: list[str] = Field(default_factory=list)


class Plan72HourResponse(BaseModel):
    generated_at: str
    terminal_name: str
    shifts: list[ShiftPlan]
    total_planned_moves: int
    high_risk_shifts_count: int
    summary: str
