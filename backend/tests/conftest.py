from collections.abc import AsyncGenerator, Generator
from datetime import datetime, timezone
from typing import Any, Literal

import factory
import factory.fuzzy
import pytest
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from testcontainers.mongodb import MongoDbContainer

from src.api.dependencies import get_session
from src.app import app
from src.core.database import Database, ensure_indexes, get_next_sequence
from src.core.security import get_password_hash
from src.core.settings import settings
from src.models import Author, Book, User
from src.schemas.token import Token
from src.schemas.users import UserResponse

TEST_DB_NAME = 'findle_test_db'


class UserFactory(factory.Factory):  # type: ignore[misc]
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'test_name_{n}')
    email = factory.LazyAttribute(lambda user: f'{user.username}@test.com')
    password_hash = factory.LazyAttribute(lambda user: f'{user.username}_pass')
    is_superuser = False


class BookFactory(factory.Factory):  # type: ignore[misc]
    class Meta:
        model = Book

    year = factory.fuzzy.FuzzyInteger(1700, 2000)
    title = factory.Sequence(lambda n: f'book_{n}')
    author_id = 1


class AuthorFactory(factory.Factory):  # type: ignore[misc]
    class Meta:
        model = Author

    name = factory.Sequence(lambda n: f'author_{n}')


class MockedUser(UserResponse):
    id: int
    clean_password: str


# --- Persistence helpers: insert factory objects straight into MongoDB ---


async def insert_user(db: Database, user: User) -> User:
    user.id = await get_next_sequence(db, 'users')
    if user.created_at is None:
        user.created_at = datetime.now(timezone.utc)
    doc = user.to_dict()
    doc['_id'] = doc.pop('id')
    await db.users.insert_one(doc)
    return user


async def insert_users(db: Database, users: list[User]) -> list[User]:
    for user in users:
        await insert_user(db, user)
    return users


async def insert_author(db: Database, author: Author) -> Author:
    author.id = await get_next_sequence(db, 'authors')
    await db.authors.insert_one({'_id': author.id, 'name': author.name})
    return author


async def insert_authors(db: Database, authors: list[Author]) -> list[Author]:
    for author in authors:
        await insert_author(db, author)
    return authors


async def insert_book(db: Database, book: Book) -> Book:
    book.id = await get_next_sequence(db, 'books')
    doc = book.to_dict()
    doc['_id'] = doc.pop('id')
    await db.books.insert_one(doc)
    return book


async def insert_books(db: Database, books: list[Book]) -> list[Book]:
    for book in books:
        await insert_book(db, book)
    return books


def _to_mocked_user(user: User, clean_password: str) -> MockedUser:
    return MockedUser(**vars(user), clean_password=clean_password)


@pytest.fixture(scope='session')
def anyio_backend() -> str:
    return 'asyncio'


@pytest.fixture(scope='session')
def mongo_container(
    anyio_backend: Literal['asyncio'],
) -> Generator[MongoDbContainer, None, None]:
    with MongoDbContainer('mongo:7') as mongo:
        yield mongo


BASE_URL = 'http://test'


@pytest.fixture
async def async_session(
    mongo_container: MongoDbContainer,
) -> AsyncGenerator[Database, None]:
    client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(
        mongo_container.get_connection_url()
    )
    await client.drop_database(TEST_DB_NAME)
    db = client[TEST_DB_NAME]
    await ensure_indexes(db)

    yield db

    client.close()


@pytest.fixture
async def async_client(
    async_session: Database,
) -> AsyncGenerator[AsyncClient, None]:
    app.dependency_overrides[get_session] = lambda: async_session
    _transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=_transport, base_url=BASE_URL, follow_redirects=True
    ) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
async def superuser_token(
    async_client: AsyncClient, superuser: MockedUser
) -> str:
    response = await async_client.post(
        '/auth/token',
        data={
            'username': superuser.email,
            'password': superuser.clean_password,
        },
    )

    json_response = Token.model_validate(response.json())
    return json_response.access_token


@pytest.fixture
async def user_token(async_client: AsyncClient, user: MockedUser) -> str:
    response = await async_client.post(
        '/auth/token',
        data={'username': user.email, 'password': user.clean_password},
    )

    json_response = Token.model_validate(response.json())
    return json_response.access_token


@pytest.fixture
async def superuser(async_session: Database) -> MockedUser:
    pwd = settings.FIRST_SUPERUSER_PASSWORD

    superuser = User(
        username=settings.FIRST_SUPERUSER_USERNAME,
        email=settings.FIRST_SUPERUSER_EMAIL,
        password_hash=get_password_hash(pwd),
        is_superuser=True,
    )

    await insert_user(async_session, superuser)

    return _to_mocked_user(superuser, pwd)


@pytest.fixture
async def user(async_session: Database) -> MockedUser:
    pwd = 'testest'

    user = UserFactory(password_hash=get_password_hash(pwd))

    await insert_user(async_session, user)

    return _to_mocked_user(user, pwd)


@pytest.fixture
async def other_user(async_session: Database) -> User:
    user = UserFactory()

    await insert_user(async_session, user)

    return user


@pytest.fixture
async def author(async_session: Database) -> Author:
    author = AuthorFactory()

    await insert_author(async_session, author)

    return author


@pytest.fixture
async def book(async_session: Database, author: Author) -> Book:
    book = BookFactory()

    await insert_book(async_session, book)

    return book
