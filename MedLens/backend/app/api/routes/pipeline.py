from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db
from app.schemas.pipeline import PipelineProcessRequest, PipelineProcessResponse
from app.services.pipeline_service import process_pipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/process", response_model=PipelineProcessResponse)
async def process(payload: PipelineProcessRequest, db=Depends(get_db)):
    try:
        return await process_pipeline(db, payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "PIPELINE_PROCESS_FAILED",
                "message": str(exc),
                "retryable": False,
            },
        ) from exc
