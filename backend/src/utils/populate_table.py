import anyio
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import AsyncSessionLocal
from src.models import Author, Book
from src.schemas.authors import AuthorSchema
from src.schemas.books import BookSchema
from src.utils import DATA


async def _get_or_create_author(
    session: AsyncSession, schema: AuthorSchema
) -> Author | None:
    author = await session.scalar(
        select(Author).where(Author.name == schema.name)
    )
    if author is not None:
        return author

    author = Author(**schema.model_dump())
    session.add(author)
    try:
        await session.commit()
        await session.refresh(author)
        return author
    except IntegrityError:
        await session.rollback()
        return await session.scalar(
            select(Author).where(Author.name == schema.name)
        )


async def _add_book_if_missing(
    session: AsyncSession,
    title: str,
    year: int,
    author_id: int,
    price: float,
) -> None:
    book_schema = BookSchema(
        title=title, year=year, author_id=author_id, price=price
    )
    exists = await session.scalar(
        select(Book).where(Book.title == book_schema.title)
    )
    if exists:
        return
    session.add(Book(**book_schema.model_dump()))
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()


async def populate_authors() -> None:
    try:
        async with AsyncSessionLocal() as session:
            for author_name, books in DATA.items():
                schema = AuthorSchema(name=author_name)
                author = await _get_or_create_author(session, schema)
                if author is None:
                    continue
                for title, (year, price) in books.items():
                    await _add_book_if_missing(
                        session, title, year, author.id, price
                    )
    except Exception as e:
        print('It was not possible to populate the database ', e)


if __name__ == '__main__':
    anyio.run(populate_authors)
