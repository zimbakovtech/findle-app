import re

from src.core.database import (
    Database,
    author_from_doc,
    book_from_doc,
    get_next_sequence,
)
from src.models import Book
from src.schemas.books import BookSchema, BookUpdate


async def _attach_author(session: Database, book: Book) -> Book:
    author_doc = await session.authors.find_one({'_id': book.author_id})
    if author_doc:
        book.author = author_from_doc(author_doc)
    return book


async def add_book(session: Database, book: BookSchema) -> Book:
    new_book = Book(**book.model_dump())
    new_book.id = await get_next_sequence(session, 'books')
    doc = new_book.to_dict()
    doc['_id'] = doc.pop('id')
    await session.books.insert_one(doc)
    return await _attach_author(session, new_book)


async def get_book_by_id(session: Database, book_id: int) -> Book | None:
    doc = await session.books.find_one({'_id': book_id})
    if not doc:
        return None
    return await _attach_author(session, book_from_doc(doc))


async def get_book_by_title(session: Database, book_title: str) -> Book | None:
    doc = await session.books.find_one({'title': book_title})
    if not doc:
        return None
    return await _attach_author(session, book_from_doc(doc))


async def get_books_list(
    session: Database,
    limit: int,
    offset: int,
    book_title: str | None = None,
    book_year: int | None = None,
) -> tuple[list[Book], int]:
    query: dict[str, object] = {}
    if book_title:
        query['title'] = {'$regex': re.escape(book_title)}
    if book_year:
        query['year'] = book_year

    total_count = await session.books.count_documents(query)

    cursor = session.books.find(query).skip(offset).limit(limit)
    books = [book_from_doc(doc) async for doc in cursor]
    for book in books:
        await _attach_author(session, book)
    return books, total_count


async def get_books_ids_list(
    session: Database, book_ids: list[int]
) -> list[int]:
    cursor = session.books.find({'_id': {'$in': book_ids}}, {'_id': 1})
    return [doc['_id'] async for doc in cursor]


async def update_book_in_db(
    session: Database,
    book_info: BookUpdate,
    book_to_update: Book,
) -> Book:
    changes = book_info.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(book_to_update, key, value)
    await session.books.update_one(
        {'_id': book_to_update.id}, {'$set': changes}
    )
    return await _attach_author(session, book_to_update)


async def delete_book(session: Database, book_to_delete: Book) -> None:
    await session.books.delete_one({'_id': book_to_delete.id})


async def delete_books_batch(session: Database, book_ids: list[int]) -> None:
    await session.books.delete_many({'_id': {'$in': book_ids}})
