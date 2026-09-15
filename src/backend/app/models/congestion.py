from pydantic import BaseModel, Field


class HourlyCongestion(BaseModel):
    time: str
    hour_offset: int
    utilisation: float
    threshold: float = 85.0
    berth_congestion: float
    yard_pressure: float
    crane_demand: float
    risk_level: str  # "low", "medium", "high", "critical"
    vessels_at_berth: int
    vessels_waiting: int


class HotspotZone(BaseModel):
    id: str
    name: str
    type: str  # "berth", "yard", "gate"
    severity: str  # "critical", "high", "medium", "low"
    current_load_pct: float
    peak_time: str
    contributing_factors: list[str] = Field(default_factory=list)
    recommendation: str


class CongestionForecastResponse(BaseModel):
    current_index: float
    status: str
    peak_forecast_time: str
    peak_forecast_index: float
    forecast_points: list[HourlyCongestion]
    hotspots: list[HotspotZone]
    contributing_factors_summary: dict[str, float]  # factor name -> percentage


class SimulationRequest(BaseModel):
    arrival_surge_pct: float = 0.0  # e.g. 15.0 for +15%
    crane_efficiency_pct: float = 100.0  # e.g. 80.0 for -20% efficiency
    adverse_weather: bool = False
    yard_dwell_multiplier: float = 1.0
    berth_closure_ids: list[str] = Field(default_factory=list)


class SimulationResult(BaseModel):
    baseline_congestion_score: float
    simulated_congestion_score: float
    delta_pct: float
    peak_congestion_time: str
    vessels_delayed_count: int
    additional_delay_hours: float
    impacted_berths: list[str]
    simulated_hourly_forecast: list[HourlyCongestion]
    mitigation_steps: list[str]
