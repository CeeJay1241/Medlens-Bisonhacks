from datetime import datetime, timedelta, timezone


class InteractionCacheRepo:
    def __init__(self, db):
        self.collection = db.interaction_cache

    async def get(self, pair_key: str) -> dict | None:
        return await self.collection.find_one({"pairKey": pair_key}, {"_id": 0})

    async def set(self, pair_key: str, result: dict, ttl_hours: int) -> None:
        now = datetime.now(tz=timezone.utc)
        expires_at = now + timedelta(hours=ttl_hours)
        await self.collection.update_one(
            {"pairKey": pair_key},
            {
                "$set": {
                    "pairKey": pair_key,
                    "result": result,
                    "createdAt": now,
                    "expiresAt": expires_at,
                }
            },
            upsert=True,
        )
