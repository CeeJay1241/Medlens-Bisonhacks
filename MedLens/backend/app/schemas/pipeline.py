from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.interactions import InteractionCheckResponse


class ExtractedEntities(BaseModel):
    medications: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)
    instructions: list[str] = Field(default_factory=list)


class ActionItem(BaseModel):
    text: str
    priority: Literal["low", "medium", "high"] = "medium"
    due: str | None = None


class PipelineProcessRequest(BaseModel):
    documentId: str
    readingLevel: str = "grade6"
    language: str = "en"
    extracted: ExtractedEntities = Field(default_factory=ExtractedEntities)
    aiResult: dict | None = None
    simplifiedSummary: str
    actionItems: list[ActionItem] = Field(default_factory=list)


class PipelineProcessResponse(BaseModel):
    documentId: str
    readingLevel: str
    language: str
    simplifiedSummary: str
    actionItems: list[ActionItem]
    interactions: InteractionCheckResponse
    ttsText: str
