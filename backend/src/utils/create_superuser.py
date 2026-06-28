import asyncio

from src.core.database import create_superuser, db, ensure_indexes


async def main() -> None:
    await ensure_indexes(db)
    await create_superuser(db)


if __name__ == '__main__':
    asyncio.run(main())
