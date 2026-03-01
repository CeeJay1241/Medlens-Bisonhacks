from app.db.mongo import get_database


async def get_db():
    return get_database()
