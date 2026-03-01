import asyncio
from types import SimpleNamespace

from app.schemas.interactions import InteractionCheckResponse
from app.schemas.pipeline import PipelineProcessRequest
from app.services import pipeline_service


def test_pipeline_uses_ai_result_medications_when_extracted_is_empty(monkeypatch) -> None:
    captured: dict[str, list[str]] = {}

    async def fake_check_interactions(self, medications: list[str]) -> InteractionCheckResponse:
        captured["medications"] = medications
        return InteractionCheckResponse(
            normalizedMedications=sorted(medications),
            interactions=[],
            status="ok",
            notes=[],
        )

    monkeypatch.setattr(
        pipeline_service.InteractionService,
        "check_interactions",
        fake_check_interactions,
    )

    payload = PipelineProcessRequest(
        documentId="doc-fallback-1",
        readingLevel="grade6",
        language="en",
        simplifiedSummary="Summary",
        actionItems=[],
        aiResult={
            "entities": {
                "medications": [
                    {"name": "Warfarin"},
                    {"drug": "Ibuprofen"},
                ]
            }
        },
    )

    fake_db = SimpleNamespace(interaction_cache=SimpleNamespace())
    result = asyncio.run(pipeline_service.process_pipeline(db=fake_db, payload=payload))

    assert captured["medications"] == ["Warfarin", "Ibuprofen"]
    assert result.interactions.normalizedMedications == ["Ibuprofen", "Warfarin"]
