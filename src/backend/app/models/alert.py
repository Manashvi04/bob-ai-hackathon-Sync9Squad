from enum import Enum
from typing import Optional
from pydantic import BaseModel


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class OperationalAlert(BaseModel):
    id: str
    title: str
    description: str
    severity: AlertSeverity
    category: str
    resource_id: Optional[str] = None
    timestamp: str
    recommended_action: str
    is_actionable: bool = True
    is_resolved: bool = False
