from pydantic import BaseModel, Field

from app.schemas.pipeline import ActionItem
from app.schemas.interactions import InteractionWarning


class PdfExportRequest(BaseModel):
    documentId: str
    simplifiedSummary: str
    actionItems: list[ActionItem] = Field(default_factory=list)
    interactions: list[InteractionWarning] = Field(default_factory=list)


class PdfExportResponse(BaseModel):
    documentId: str
    downloadPath: str
    downloadUrl: str
