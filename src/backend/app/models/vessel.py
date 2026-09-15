from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class VesselStatus(str, Enum):
    AT_BERTH = "at_berth"
    ANCHORED = "anchored"
    SCHEDULED = "scheduled"
    DEPARTED = "departed"
    DELAYED = "delayed"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class VesselType(str, Enum):
    ULCV = "ULCV (18k-24k TEU)"
    NEO_PANAMAX = "Neo-Panamax (10k-14k TEU)"
    POST_PANAMAX = "Post-Panamax (6k-9k TEU)"
    PANAMAX = "Panamax (4k-5.5k TEU)"
    FEEDERMAX = "Feedermax (2k-3.5k TEU)"
    FEEDER = "Feeder (<2k TEU)"


class Vessel(BaseModel):
    id: str
    name: str
    imo: str
    call_sign: str
    flag: str
    carrier: str
    vessel_type: VesselType
    teu_capacity: int
    length_overall_m: float
    beam_m: float
    draft_m: float
    inbound_teu: int
    outbound_teu: int
    total_moves: int
    eta: str
    etd: str
    actual_arrival: Optional[str] = None
    actual_departure: Optional[str] = None
    status: VesselStatus
    assigned_berth: Optional[str] = None
    assigned_cranes: list[str] = Field(default_factory=list)
    congestion_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.LOW
    delay_hours: float = 0.0
    origin_port: str
    destination_port: str
    priority: str = "normal"  # "normal", "high", "express"
    dwell_time_hours: float = 0.0
    recommended_action: Optional[str] = None
    suggested_speed_knots: Optional[float] = None


class VesselCreate(BaseModel):
    name: str
    imo: str
    call_sign: str
    flag: str = "Panama"
    carrier: str
    vessel_type: VesselType = VesselType.POST_PANAMAX
    teu_capacity: int = 8000
    length_overall_m: float = 300.0
    beam_m: float = 40.0
    draft_m: float = 13.5
    inbound_teu: int = 1200
    outbound_teu: int = 900
    eta: str
    etd: str
    status: VesselStatus = VesselStatus.SCHEDULED
    assigned_berth: Optional[str] = None
    assigned_cranes: list[str] = Field(default_factory=list)
    origin_port: str = "Singapore"
    destination_port: str = "Rotterdam"
    priority: str = "normal"


class VesselUpdate(BaseModel):
    eta: Optional[str] = None
    etd: Optional[str] = None
    status: Optional[VesselStatus] = None
    assigned_berth: Optional[str] = None
    assigned_cranes: Optional[list[str]] = None
    inbound_teu: Optional[int] = None
    outbound_teu: Optional[int] = None
    delay_hours: Optional[float] = None
    priority: Optional[str] = None
