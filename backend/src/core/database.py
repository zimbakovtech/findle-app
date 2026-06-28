from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.core.security import get_password_hash
from src.core.settings import settings
from src.models import Author, Book, User

Database = AsyncIOMotorDatabase[Any]

client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(
    settings.MONGODB_URL
)
db: Database = client[settings.MONGODB_DB]


async def get_next_sequence(database: Database, name: str) -> int:
    """Atomically increment and return the next sequential id for a collection.

    Emulates SQL-style auto-increment primary keys so document ``_id``
    values stay as integers, preserving the existing API/JSON contract.
    """
    counter = await database.counters.find_one_and_update(
        {'_id': name},
        {'$inc': {'seq': 1}},
        upsert=True,
        return_document=True,
    )
    return int(counter['seq'])


async def ensure_indexes(database: Database) -> None:
    """Recreate the unique constraints / lookup indexes from the SQL schema."""
    await database.users.create_index('username', unique=True)
    await database.users.create_index('email', unique=True)
    await database.authors.create_index('name', unique=True)
    await database.books.create_index('title', unique=True)
    await database.books.create_index('author_id')


def user_from_doc(doc: dict[str, Any]) -> User:
    return User(
        id=doc['_id'],
        username=doc['username'],
        email=doc['email'],
        password_hash=doc['password_hash'],
        first_name=doc.get('first_name'),
        last_name=doc.get('last_name'),
        is_superuser=doc.get('is_superuser', False),
        is_active=doc.get('is_active', True),
        is_verified=doc.get('is_verified', False),
        google_sub=doc.get('google_sub'),
        created_at=doc.get('created_at'),
        updated_at=doc.get('updated_at'),
    )


def author_from_doc(doc: dict[str, Any]) -> Author:
    return Author(id=doc['_id'], name=doc['name'])


def book_from_doc(doc: dict[str, Any]) -> Book:
    return Book(
        id=doc['_id'],
        year=doc['year'],
        title=doc['title'],
        author_id=doc['author_id'],
        price=doc.get('price'),
    )


async def create_superuser(database: Database) -> None:
    existing = await database.users.find_one({
        'email': settings.FIRST_SUPERUSER_EMAIL
    })

    if not existing:
        user_id = await get_next_sequence(database, 'users')
        await database.users.insert_one({
            '_id': user_id,
            'username': settings.FIRST_SUPERUSER_USERNAME,
            'email': settings.FIRST_SUPERUSER_EMAIL,
            'password_hash': get_password_hash(
                settings.FIRST_SUPERUSER_PASSWORD
            ),
            'first_name': None,
            'last_name': None,
            'is_superuser': True,
            'is_active': True,
            'is_verified': True,
            'google_sub': None,
            'created_at': datetime.now(timezone.utc),
            'updated_at': None,
        })
