from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Author
from src.schemas.authors import AuthorSchema


async def add_author(session: AsyncSession, author: AuthorSchema) -> Author:
    new_author = Author(**author.model_dump())
    session.add(new_author)
    await session.commit()
    await session.refresh(new_author)
    return new_author


async def get_author_by_id(
    session: AsyncSession, author_id: int
) -> Author | None:
    return await session.scalar(select(Author).where(Author.id == author_id))


async def get_author_by_name(
    session: AsyncSession, author_name: str
) -> Author | None:
    return await session.scalar(
        select(Author).where(Author.name == author_name)
    )


async def get_filtered_authors_list(
    session: AsyncSession,
    limit: int | None,
    author_name: str | None = None,
    offset: int = 0,
) -> tuple[list[Author], int]:
    query = select(Author)
    count_query = select(func.count(Author.id))

    if author_name:
        filter_condition = Author.name.contains(author_name)
        query = query.filter(filter_condition)
        count_query = count_query.filter(filter_condition)

    if limit:
        query = query.limit(limit).offset(offset)

    total_count = await session.scalar(count_query)
    authors_db = await session.scalars(query)
    return list(authors_db.all()), total_count or 0


async def get_authors_ids_list(
    session: AsyncSession, author_ids: list[int]
) -> list[int]:
    authors_list = await session.scalars(
        select(Author.id).filter(Author.id.in_(author_ids))
    )
    return list(authors_list.all())


async def update_author_info(
    session: AsyncSession, author_to_update: Author, author_info: AuthorSchema
) -> Author:
    for key, value in author_info.model_dump(exclude_unset=True).items():
        setattr(author_to_update, key, value)
    session.add(author_to_update)
    await session.commit()
    await session.refresh(author_to_update)
    return author_to_update


async def delete_author(
    session: AsyncSession, author_to_delete: Author
) -> None:
    await session.delete(author_to_delete)
    await session.commit()


async def delete_authors_batch(
    session: AsyncSession, author_ids: list[int]
) -> None:
    await session.execute(delete(Author).where(Author.id.in_(author_ids)))
    await session.commit()
