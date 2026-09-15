from typing import Optional
from pydantic import BaseModel, Field


class RoutingRecommendation(BaseModel):
    id: str
    vessel_id: str
    vessel_name: str
    carrier: str
    strategy_type: str  # "Virtual Arrival", "Berth Swap", "Feeder Divert", "Discharge Resequence"
    current_status: str
    original_eta: str
    recommended_eta: str
    fuel_saved_tons: float
    co2_reduction_tons: float
    cost_savings_usd: float
    delay_hours_mitigated: float
    berth_window: str
    rationale: str
    action_label: str
    status: str = "pending"  # "pending", "applied", "dismissed"


class AlternateRoutingResponse(BaseModel):
    total_fuel_saved_tons: float
    total_co2_reduction_tons: float
    total_cost_savings_usd: float
    high_impact_vessels_count: int
    recommendations: list[RoutingRecommendation] = Field(default_factory=list)
