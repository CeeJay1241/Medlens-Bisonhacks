from pydantic import BaseModel, Field

from app.schemas.pipeline import ActionItem


class TtsTextRequest(BaseModel):
    documentId: str
    summary: str
    actionItems: list[ActionItem] = Field(default_factory=list)


class TtsTextResponse(BaseModel):
    documentId: str
    text: str


class TtsAudioRequest(BaseModel):
    documentId: str
    text: str
    voiceId: str | None = None
    modelId: str | None = None
    stability: float | None = None
    similarityBoost: float | None = None


class TtsAudioResponse(BaseModel):
    documentId: str
    provider: str
    audioPath: str
    audioUrl: str
