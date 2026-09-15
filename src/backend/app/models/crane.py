from typing import Optional
from pydantic import BaseModel


class QuayCrane(BaseModel):
    id: str
    name: str
    berth_id: str
    moves_per_hour: int = 32
    status: str = "active"  # "active", "idle", "maintenance"
    assigned_vessel_id: Optional[str] = None
    assigned_vessel_name: Optional[str] = None
    hours_operated: float = 1420.5
    next_maintenance: str = "2026-09-22"
    efficiency_pct: float = 94.0
    operator_gang: Optional[str] = "Gang A-1"
