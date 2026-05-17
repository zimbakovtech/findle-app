import anyio
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from src.core.database import AsyncSessionLocal
from src.models import Author, Book
from src.schemas.authors import AuthorSchema
from src.schemas.books import BookSchema
from src.utils import DATA


async def populate_authors() -> None:
    try:
        async with AsyncSessionLocal() as session:
            for author_name, books in DATA.items():
                schema = AuthorSchema(name=author_name)

                author = await session.scalar(
                    select(Author).where(Author.name == schema.name)
                )
                if author is None:
                    author = Author(**schema.model_dump())
                    session.add(author)
                    try:
                        await session.commit()
                        await session.refresh(author)
                    except IntegrityError:
                        await session.rollback()
                        author = await session.scalar(
                            select(Author).where(Author.name == schema.name)
                        )
                        if author is None:
                            continue

                for title, (year, price) in books.items():
                    exists = await session.scalar(
                        select(Book).where(Book.title == BookSchema(
                            title=title, year=year, author_id=author.id, price=price
                        ).title)
                    )
                    if exists:
                        continue
                    book_schema = BookSchema(
                        title=title, year=year, author_id=author.id, price=price
                    )
                    session.add(Book(**book_schema.model_dump()))
                    try:
                        await session.commit()
                    except IntegrityError:
                        await session.rollback()
    except Exception as e:
        print('It was not possible to populate the database ', e)


if __name__ == '__main__':
    anyio.run(populate_authors)
