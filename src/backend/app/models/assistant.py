from typing import Optional
from pydantic import BaseModel, Field


class AssistantQuery(BaseModel):
    query: str
    context_module: Optional[str] = None


class AssistantResponse(BaseModel):
    answer: str
    suggested_actions: list[str] = Field(default_factory=list)
    related_metrics: dict[str, str] = Field(default_factory=dict)
    confidence: float = 0.96
    timestamp: str
