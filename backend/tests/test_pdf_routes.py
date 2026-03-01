from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_pdf_export_and_download() -> None:
    payload = {
        "documentId": "pdf-test-001",
        "simplifiedSummary": "Summary for pdf",
        "actionItems": [{"text": "Do the thing", "priority": "medium", "due": None}],
        "interactions": [],
    }

    export_response = client.post("/api/pdf/export", json=payload)
    assert export_response.status_code == 200
    export_data = export_response.json()
    assert export_data["documentId"] == "pdf-test-001"
    assert export_data["downloadUrl"] == "/api/pdf/download/pdf-test-001"

    download_response = client.get(export_data["downloadUrl"])
    assert download_response.status_code == 200
    assert download_response.headers["content-type"].startswith("application/pdf")


def test_pdf_download_not_found() -> None:
    response = client.get("/api/pdf/download/does-not-exist")
    assert response.status_code == 404
    detail = response.json()["detail"]
    assert detail["code"] == "PDF_NOT_FOUND"
