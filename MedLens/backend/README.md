# Backend (FastAPI)

FastAPI backend for the hackathon pipeline:
- document processing contract
- drug interaction checks (with Mongo TTL cache)
- PDF export
- text payload for frontend Web Speech API playback

## Quickstart

1. Create venv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

2. Copy envs:

```bash
cp .env.example .env
```

3. Run API:

```bash
uvicorn app.main:app --reload --port 8000
```

4. Health checks:
- `GET http://localhost:8000/api/health`
- `GET http://localhost:8000/api/ready`

## Main Endpoints
- `POST /api/interactions/check`
- `POST /api/pipeline/process`
- `POST /api/pdf/export`
- `GET /api/pdf/download/{documentId}`
- `POST /api/tts/text`
- `POST /api/tts/audio`
- `GET /api/tts/download/{documentId}`

## Notes
- OpenFDA integration is intentionally lightweight for hackathon speed.
- A built-in fallback rule set catches common demo pairs (e.g., warfarin + ibuprofen).

## Person 2 Integration Contract
- `POST /api/pipeline/process` accepts medication names from either:
  - `extracted.medications`
  - `aiResult.medications`
  - `aiResult.entities.medications`
  - `aiResult.extracted.medications`
- Medication entries can be strings or objects with one of:
  - `name`
  - `medication`
  - `drug`
- If `extracted.medications` is empty, backend automatically falls back to `aiResult` extraction.

## Team Integration Files
- API contract: `backend/docs/api-contract.md`
- Sample payloads:
  - `backend/samples/pipeline_from_person2_entities.json`
  - `backend/samples/pipeline_from_extracted_direct.json`
