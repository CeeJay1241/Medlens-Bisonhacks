from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.schemas.pdf import PdfExportRequest, PdfExportResponse

PDF_OUT_DIR = Path("/tmp/med-doc-pdfs")


def get_pdf_path(document_id: str) -> Path:
    return PDF_OUT_DIR / f"{document_id}.pdf"


def _draw_wrapped_text(pdf: canvas.Canvas, text: str, start_x: int, start_y: int, width_chars: int = 90) -> int:
    y = start_y
    words = text.split()
    current = []
    for word in words:
        candidate = " ".join(current + [word])
        if len(candidate) <= width_chars:
            current.append(word)
        else:
            pdf.drawString(start_x, y, " ".join(current))
            y -= 14
            current = [word]
    if current:
        pdf.drawString(start_x, y, " ".join(current))
        y -= 14
    return y


def export_pdf(payload: PdfExportRequest) -> PdfExportResponse:
    PDF_OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = get_pdf_path(payload.documentId)

    pdf = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter

    y = int(height - 50)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Medical Document Summary")
    y -= 24

    pdf.setFont("Helvetica", 11)
    y = _draw_wrapped_text(pdf, payload.simplifiedSummary, 50, y)
    y -= 8

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "Action Items")
    y -= 18
    pdf.setFont("Helvetica", 11)
    if payload.actionItems:
        for item in payload.actionItems:
            y = _draw_wrapped_text(pdf, f"- {item.text}", 50, y)
    else:
        pdf.drawString(50, y, "- None")
        y -= 14

    y -= 8
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "Drug Interaction Warnings")
    y -= 18
    pdf.setFont("Helvetica", 11)
    if payload.interactions:
        for interaction in payload.interactions:
            y = _draw_wrapped_text(
                pdf,
                f"- {interaction.drugA} + {interaction.drugB}: {interaction.severity.upper()} - {interaction.warning}",
                50,
                y,
            )
    else:
        pdf.drawString(50, y, "- None")

    pdf.save()
    return PdfExportResponse(
        documentId=payload.documentId,
        downloadPath=str(output_path),
        downloadUrl=f"/api/pdf/download/{payload.documentId}",
    )
