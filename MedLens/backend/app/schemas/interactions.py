from typing import Literal

from pydantic import BaseModel, Field


class InteractionCheckRequest(BaseModel):
    medications: list[str] = Field(default_factory=list)


class InteractionWarning(BaseModel):
    drugA: str
    drugB: str
    severity: Literal["low", "medium", "high"]
    warning: str
    evidence: str
    source: str


class InteractionCheckResponse(BaseModel):
    normalizedMedications: list[str]
    interactions: list[InteractionWarning]
    disclaimer: str = "Educational only, not medical advice."
    status: Literal["ok", "partial"] = "ok"
    notes: list[str] = Field(default_factory=list)
