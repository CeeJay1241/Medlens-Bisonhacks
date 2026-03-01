from app.services.medication_extraction import extract_medication_names


def test_extract_medication_names_from_multiple_shapes() -> None:
    payload = {
        "medications": ["Aspirin"],
        "entities": {"medications": [{"name": "Metformin"}]},
        "extracted": {"medications": [{"drug": "Lisinopril"}]},
    }

    assert extract_medication_names(payload) == ["Aspirin", "Metformin", "Lisinopril"]


def test_extract_medication_names_deduplicates_case_insensitive() -> None:
    payload = {
        "medications": ["aspirin", "Aspirin", " ASPIRIN "]
    }

    assert extract_medication_names(payload) == ["aspirin"]


def test_extract_medication_names_handles_invalid_payload() -> None:
    assert extract_medication_names(None) == []
    assert extract_medication_names("bad") == []
