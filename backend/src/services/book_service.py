from sqlalchemy import and_, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models import Book
from src.schemas.books import BookSchema, BookUpdate


async def add_book(session: AsyncSession, book: BookSchema) -> Book:
    new_book = Book(**book.model_dump())
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book, attribute_names=['author'])
    return new_book


async def get_book_by_id(session: AsyncSession, book_id: int) -> Book | None:
    return await session.scalar(
        select(Book).options(selectinload(Book.author)).where(Book.id == book_id)
    )


async def get_book_by_title(session: AsyncSession, book_title: str) -> Book | None:
    return await session.scalar(
        select(Book).options(selectinload(Book.author)).where(Book.title == book_title)
    )


async def get_books_list(
    session: AsyncSession,
    limit: int,
    offset: int,
    book_title: str | None = None,
    book_year: int | None = None,
) -> tuple[list[Book], int]:
    query = select(Book).options(selectinload(Book.author))
    count_query = select(func.count(Book.id))

    if book_title and book_year:
        condition = and_(Book.title.contains(book_title), Book.year == book_year)
        query = query.where(condition)
        count_query = count_query.filter(condition)
    elif book_title:
        condition = Book.title.contains(book_title)
        query = query.where(condition)
        count_query = count_query.filter(condition)
    elif book_year:
        condition = Book.year == book_year
        query = query.where(condition)
        count_query = count_query.filter(condition)

    total_count = await session.scalar(count_query)
    books_db = await session.scalars(query.limit(limit).offset(offset))
    return list(books_db.all()), total_count or 0


async def get_books_ids_list(session: AsyncSession, book_ids: list[int]) -> list[int]:
    books_list = await session.scalars(
        select(Book.id).filter(Book.id.in_(book_ids))
    )
    return list(books_list.all())


async def update_book_in_db(
    session: AsyncSession, book_info: BookUpdate, book_to_update: Book
) -> Book:
    for key, value in book_info.model_dump(exclude_unset=True).items():
        setattr(book_to_update, key, value)
    session.add(book_to_update)
    await session.commit()
    await session.refresh(book_to_update, attribute_names=['author'])
    return book_to_update


async def delete_book(session: AsyncSession, book_to_delete: Book) -> None:
    await session.delete(book_to_delete)
    await session.commit()


async def delete_books_batch(session: AsyncSession, book_ids: list[int]) -> None:
    await session.execute(delete(Book).where(Book.id.in_(book_ids)))
    await session.commit()
