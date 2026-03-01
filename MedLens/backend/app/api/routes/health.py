from fastapi import APIRouter, Depends

from app.api.deps import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/ready")
async def ready(db=Depends(get_db)):
    await db.command("ping")
    return {"status": "ready"}
