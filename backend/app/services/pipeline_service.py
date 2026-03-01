from app.schemas.pipeline import PipelineProcessRequest, PipelineProcessResponse
from app.schemas.tts import TtsTextRequest
from app.services.interaction_service import InteractionService
from app.services.medication_extraction import extract_medication_names
from app.services.tts_service import build_tts_text


async def process_pipeline(db, payload: PipelineProcessRequest) -> PipelineProcessResponse:
    interaction_service = InteractionService(db)
    meds = payload.extracted.medications or []
    if not meds and payload.aiResult:
        meds = extract_medication_names(payload.aiResult)

    interactions = await interaction_service.check_interactions(meds)

    tts = build_tts_text(
        TtsTextRequest(
            documentId=payload.documentId,
            summary=payload.simplifiedSummary,
            actionItems=payload.actionItems,
        )
    )

    return PipelineProcessResponse(
        documentId=payload.documentId,
        readingLevel=payload.readingLevel,
        language=payload.language,
        simplifiedSummary=payload.simplifiedSummary,
        actionItems=payload.actionItems,
        interactions=interactions,
        ttsText=tts.text,
    )
