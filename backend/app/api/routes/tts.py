import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.schemas.tts import TtsAudioRequest, TtsAudioResponse, TtsTextRequest, TtsTextResponse
from app.services.tts_service import build_tts_text, get_tts_audio_path, synthesize_tts_audio

router = APIRouter(prefix="/tts", tags=["tts"])


@router.post("/text", response_model=TtsTextResponse)
async def tts_text(payload: TtsTextRequest):
    try:
        return build_tts_text(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "TTS_TEXT_BUILD_FAILED",
                "message": str(exc),
                "retryable": False,
            },
        ) from exc


@router.post("/audio", response_model=TtsAudioResponse)
async def tts_audio(payload: TtsAudioRequest):
    try:
        return await synthesize_tts_audio(payload)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "code": "TTS_PROVIDER_NOT_CONFIGURED",
                "message": str(exc),
                "retryable": False,
            },
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail={
                "status": "error",
                "code": "TTS_PROVIDER_TIMEOUT",
                "message": "ElevenLabs timed out.",
                "retryable": True,
            },
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "code": "TTS_PROVIDER_HTTP_ERROR",
                "message": f"ElevenLabs returned HTTP {exc.response.status_code}.",
                "retryable": True,
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "TTS_AUDIO_FAILED",
                "message": str(exc),
                "retryable": True,
            },
        ) from exc


@router.get("/download/{document_id}")
async def tts_download(document_id: str):
    file_path = get_tts_audio_path(document_id)
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "code": "TTS_AUDIO_NOT_FOUND",
                "message": f"No generated TTS audio found for documentId={document_id}",
                "retryable": False,
            },
        )

    return FileResponse(
        str(file_path),
        media_type="audio/mpeg",
        filename=f"{document_id}.mp3",
    )
