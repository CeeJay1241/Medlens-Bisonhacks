from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.schemas.pdf import PdfExportRequest, PdfExportResponse
from app.services.pdf_service import export_pdf, get_pdf_path

router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/export", response_model=PdfExportResponse)
async def pdf_export(payload: PdfExportRequest):
    try:
        return export_pdf(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "PDF_EXPORT_FAILED",
                "message": str(exc),
                "retryable": True,
            },
        ) from exc


@router.get("/download/{document_id}")
async def pdf_download(document_id: str):
    file_path = get_pdf_path(document_id)
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "code": "PDF_NOT_FOUND",
                "message": f"No PDF found for documentId={document_id}",
                "retryable": False,
            },
        )

    return FileResponse(
        str(file_path),
        media_type="application/pdf",
        filename=f"{document_id}.pdf",
    )
