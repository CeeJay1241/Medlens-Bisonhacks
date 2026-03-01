from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_tts_audio_not_configured() -> None:
    payload = {
        "documentId": "tts-001",
        "text": "Hello from medlens",
    }

    response = client.post("/api/tts/audio", json=payload)
    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["code"] == "TTS_PROVIDER_NOT_CONFIGURED"


def test_tts_download_not_found() -> None:
    response = client.get("/api/tts/download/not-found")
    assert response.status_code == 404
    detail = response.json()["detail"]
    assert detail["code"] == "TTS_AUDIO_NOT_FOUND"
