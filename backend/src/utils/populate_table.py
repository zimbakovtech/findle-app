import asyncio

from pymongo.errors import DuplicateKeyError

from src.core.database import Database, db, get_next_sequence
from src.schemas.authors import AuthorSchema
from src.schemas.books import BookSchema
from src.utils import DATA


async def _get_or_create_author(
    database: Database, schema: AuthorSchema
) -> int | None:
    existing = await database.authors.find_one({'name': schema.name})
    if existing is not None:
        return int(existing['_id'])

    author_id = await get_next_sequence(database, 'authors')
    try:
        await database.authors.insert_one({
            '_id': author_id,
            'name': schema.name,
        })
        return author_id
    except DuplicateKeyError:
        existing = await database.authors.find_one({'name': schema.name})
        return int(existing['_id']) if existing else None


async def _add_book_if_missing(
    database: Database,
    title: str,
    year: int,
    author_id: int,
    price: float,
) -> None:
    book_schema = BookSchema(
        title=title, year=year, author_id=author_id, price=price
    )
    if await database.books.find_one({'title': book_schema.title}):
        return
    book_id = await get_next_sequence(database, 'books')
    try:
        await database.books.insert_one({
            '_id': book_id,
            'title': book_schema.title,
            'year': book_schema.year,
            'author_id': book_schema.author_id,
            'price': book_schema.price,
        })
    except DuplicateKeyError:
        pass


async def populate_authors() -> None:
    try:
        for author_name, books in DATA.items():
            schema = AuthorSchema(name=author_name)
            author_id = await _get_or_create_author(db, schema)
            if author_id is None:
                continue
            for title, (year, price) in books.items():
                await _add_book_if_missing(db, title, year, author_id, price)
    except Exception as e:
        print('It was not possible to populate the database ', e)


if __name__ == '__main__':
    asyncio.run(populate_authors())
