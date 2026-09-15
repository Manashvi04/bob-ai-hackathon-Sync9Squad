from pydantic import BaseModel


class YardZone(BaseModel):
    id: str
    name: str
    zone_type: str  # "Import", "Export", "Reefer", "Transshipment", "Empty"
    capacity_teu: int
    current_occupancy_teu: int
    utilization_pct: float
    avg_dwell_days: float
    risk_level: str  # "safe", "warning", "critical"
    assigned_rtgs: int  # Rubber Tired Gantries
    reefer_plugs_total: int = 0
    reefer_plugs_used: int = 0
    hazmat_count: int = 0
