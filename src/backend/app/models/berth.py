from typing import Optional
from pydantic import BaseModel, Field


class Berth(BaseModel):
    id: str
    name: str
    length_m: float
    max_draft_m: float
    max_teu_capacity: int
    compatible_vessel_types: list[str] = Field(default_factory=list)
    assigned_crane_ids: list[str] = Field(default_factory=list)
    current_vessel_id: Optional[str] = None
    current_vessel_name: Optional[str] = None
    status: str = "available"  # "occupied", "available", "maintenance", "reserved"
    utilization_pct: float = 0.0
    queue_count: int = 0
    bollard_count: int = 32
    hourly_rate_usd: float = 850.0
