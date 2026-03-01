from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db
from app.schemas.interactions import InteractionCheckRequest, InteractionCheckResponse
from app.services.interaction_service import InteractionService

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.post("/check", response_model=InteractionCheckResponse)
async def check_interactions(payload: InteractionCheckRequest, db=Depends(get_db)):
    try:
        service = InteractionService(db)
        return await service.check_interactions(payload.medications)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "status": "error",
                "code": "INTERACTION_CHECK_FAILED",
                "message": str(exc),
                "retryable": True,
            },
        ) from exc
