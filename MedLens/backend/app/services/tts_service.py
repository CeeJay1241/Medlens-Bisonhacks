from pathlib import Path
import re

import httpx

from app.core.config import settings
from app.schemas.tts import TtsAudioRequest, TtsAudioResponse, TtsTextRequest, TtsTextResponse

TTS_OUT_DIR = Path("/tmp/med-doc-tts")


def _safe_document_id(document_id: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", document_id.strip())
    return safe or "document"


def get_tts_audio_path(document_id: str) -> Path:
    return TTS_OUT_DIR / f"{_safe_document_id(document_id)}.mp3"


def build_tts_text(payload: TtsTextRequest) -> TtsTextResponse:
    lines = [payload.summary.strip()]
    if payload.actionItems:
        lines.append("Action items:")
        for idx, item in enumerate(payload.actionItems, start=1):
            lines.append(f"{idx}. {item.text}")
    text = "\n".join(line for line in lines if line)
    return TtsTextResponse(documentId=payload.documentId, text=text)


async def synthesize_tts_audio(payload: TtsAudioRequest) -> TtsAudioResponse:
    if not settings.elevenlabs_api_key:
        raise RuntimeError("ELEVENLABS_API_KEY is not configured.")

    voice_id = payload.voiceId or settings.elevenlabs_voice_id
    model_id = payload.modelId or settings.elevenlabs_model_id
    url = f"{settings.elevenlabs_base_url}/text-to-speech/{voice_id}"

    voice_settings = {}
    if payload.stability is not None:
        voice_settings["stability"] = payload.stability
    if payload.similarityBoost is not None:
        voice_settings["similarity_boost"] = payload.similarityBoost

    request_body = {
        "text": payload.text,
        "model_id": model_id,
    }
    if voice_settings:
        request_body["voice_settings"] = voice_settings

    headers = {
        "xi-api-key": settings.elevenlabs_api_key,
        "accept": "audio/mpeg",
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=settings.elevenlabs_timeout_seconds) as client:
        response = await client.post(url, headers=headers, json=request_body)
        response.raise_for_status()
        audio_bytes = response.content

    TTS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = get_tts_audio_path(payload.documentId)
    output_path.write_bytes(audio_bytes)

    return TtsAudioResponse(
        documentId=payload.documentId,
        provider="elevenlabs",
        audioPath=str(output_path),
        audioUrl=f"/api/tts/download/{_safe_document_id(payload.documentId)}",
    )
