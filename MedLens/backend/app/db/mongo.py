from typing import Optional, Any

try:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
except ModuleNotFoundError:  # pragma: no cover
    # Motor is an optional dependency in some environments (e.g. CI/tests).
    # We keep the module importable so routes that don't touch the DB can still run.
    AsyncIOMotorClient = Any  # type: ignore
    AsyncIOMotorDatabase = Any  # type: ignore

from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None


def connect_to_mongo() -> AsyncIOMotorDatabase:
    global client
    if AsyncIOMotorClient is Any:  # Motor not installed
        raise RuntimeError(
            "Mongo driver 'motor' is not installed. Install backend dependencies to enable database features."
        )
    if client is None:
        client = AsyncIOMotorClient(
            settings.mongo_uri,
            serverSelectionTimeoutMS=settings.mongo_server_selection_timeout_ms,
            connectTimeoutMS=settings.mongo_connect_timeout_ms,
            socketTimeoutMS=settings.mongo_socket_timeout_ms,
        )
    return client[settings.mongo_db]


def close_mongo() -> None:
    global client
    if client is not None:
        client.close()
        client = None


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        return connect_to_mongo()
    return client[settings.mongo_db]
