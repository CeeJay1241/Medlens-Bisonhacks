import logging
import asyncio
from itertools import combinations

import httpx

from app.core.config import settings
from app.repositories.interaction_cache_repo import InteractionCacheRepo
from app.schemas.interactions import InteractionCheckResponse, InteractionWarning

logger = logging.getLogger(__name__)

KNOWN_INTERACTIONS = {
    tuple(sorted(("warfarin", "ibuprofen"))): InteractionWarning(
        drugA="warfarin",
        drugB="ibuprofen",
        severity="high",
        warning="Concurrent use may increase bleeding risk.",
        evidence="Known anticoagulant + NSAID risk pattern.",
        source="https://open.fda.gov/",
    ),
    tuple(sorted(("lisinopril", "ibuprofen"))): InteractionWarning(
        drugA="lisinopril",
        drugB="ibuprofen",
        severity="medium",
        warning="NSAIDs may reduce antihypertensive effect and affect kidney function.",
        evidence="Label-level caution patterns from drug references.",
        source="https://open.fda.gov/",
    ),
}


class InteractionService:
    def __init__(self, db):
        self.db = db
        self.cache = InteractionCacheRepo(db)
        self.cache_available = True

    @staticmethod
    def normalize_meds(medications: list[str]) -> list[str]:
        cleaned = [m.strip().lower() for m in medications if m and m.strip()]
        return sorted(set(cleaned))

    async def _check_pair_openfda(
        self,
        client: httpx.AsyncClient,
        drug_a: str,
        drug_b: str,
    ) -> tuple[InteractionWarning | None, str | None]:
        search = f'openfda.generic_name:"{drug_a}"+AND+openfda.generic_name:"{drug_b}"'
        url = f"{settings.openfda_base_url}/drug/label.json"
        params = {"search": search, "limit": 1}

        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                total = response.json().get("meta", {}).get("results", {}).get("total", 0)
                if total and total > 0:
                    return (
                        InteractionWarning(
                            drugA=drug_a,
                            drugB=drug_b,
                            severity="medium",
                            warning="Potential interaction signal found in FDA label metadata.",
                            evidence="OpenFDA label query match.",
                            source="https://open.fda.gov/apis/drug/label/",
                        ),
                        None,
                    )
                return None, None

            if response.status_code == 429:
                await asyncio.sleep(settings.openfda_rate_limit_backoff_seconds)
                return None, "OpenFDA rate-limited one or more pair lookups."

            return None, f"OpenFDA returned HTTP {response.status_code} for one or more pair lookups."
        except httpx.TimeoutException:
            return None, "OpenFDA timeout for one or more pair lookups."
        except Exception as exc:
            logger.warning("OpenFDA query failed for %s/%s: %s", drug_a, drug_b, exc)
            return None, "OpenFDA unavailable for one or more pair lookups."

    async def _process_pair(
        self,
        client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        drug_a: str,
        drug_b: str,
    ) -> tuple[InteractionWarning | None, str | None, bool]:
        pair_key = "|".join(sorted((drug_a, drug_b)))
        pair_tuple = tuple(sorted((drug_a, drug_b)))

        known = KNOWN_INTERACTIONS.get(pair_tuple)
        if known:
            await self._cache_set_safe(pair_key, known.model_dump())
            return known, None, False

        cached = await self._cache_get_safe(pair_key)
        if cached and cached.get("result"):
            return InteractionWarning(**cached["result"]), None, False

        async with semaphore:
            warning, note = await self._check_pair_openfda(client, drug_a, drug_b)

        if warning:
            await self._cache_set_safe(pair_key, warning.model_dump())
            return warning, note, False

        await self._cache_set_safe(pair_key, {})
        return None, note, True

    async def _cache_get_safe(self, pair_key: str) -> dict | None:
        if not self.cache_available:
            return None
        try:
            return await self.cache.get(pair_key)
        except Exception as exc:
            logger.warning("Cache read failed for %s: %s", pair_key, exc)
            self.cache_available = False
            return None

    async def _cache_set_safe(self, pair_key: str, result: dict) -> None:
        if not self.cache_available:
            return
        try:
            await self.cache.set(pair_key, result, settings.interaction_cache_ttl_hours)
        except Exception as exc:
            logger.warning("Cache write failed for %s: %s", pair_key, exc)
            self.cache_available = False

    async def check_interactions(self, medications: list[str]) -> InteractionCheckResponse:
        meds = self.normalize_meds(medications)
        if len(meds) < 2:
            return InteractionCheckResponse(
                normalizedMedications=meds,
                interactions=[],
                status="ok",
                notes=[],
            )

        interactions: list[InteractionWarning] = []
        notes: set[str] = set()
        partial = False
        semaphore = asyncio.Semaphore(max(1, settings.openfda_max_concurrency))
        tasks = []
        async with httpx.AsyncClient(timeout=settings.openfda_timeout_seconds) as client:
            for drug_a, drug_b in combinations(meds, 2):
                tasks.append(self._process_pair(client, semaphore, drug_a, drug_b))

            results = await asyncio.gather(*tasks)

        for warning, note, mark_partial in results:
            if warning:
                interactions.append(warning)
            if note:
                notes.add(note)
            if mark_partial:
                partial = True

        if partial:
            notes.add("Some medication pairs returned no explicit interaction signal from current sources.")

        return InteractionCheckResponse(
            normalizedMedications=meds,
            interactions=interactions,
            status="partial" if partial else "ok",
            notes=sorted(notes),
        )
