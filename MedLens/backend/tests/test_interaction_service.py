import asyncio
from types import SimpleNamespace

from app.services.interaction_service import InteractionService


def test_check_interactions_with_zero_or_one_medication() -> None:
    fake_db = SimpleNamespace(interaction_cache=SimpleNamespace())
    service = InteractionService(fake_db)
    service.cache_available = False

    zero = asyncio.run(service.check_interactions([]))
    one = asyncio.run(service.check_interactions(["Aspirin"]))

    assert zero.normalizedMedications == []
    assert zero.interactions == []
    assert zero.status == "ok"

    assert one.normalizedMedications == ["aspirin"]
    assert one.interactions == []
    assert one.status == "ok"
