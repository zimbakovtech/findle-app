import asyncio

from src.core.database import client, db, ensure_indexes
from src.core.settings import settings


async def main() -> None:
    await client.drop_database(settings.MONGODB_DB)
    await ensure_indexes(db)


if __name__ == '__main__':
    asyncio.run(main())
