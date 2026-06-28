import re

from src.core.database import Database, author_from_doc, get_next_sequence
from src.models import Author
from src.schemas.authors import AuthorSchema


async def add_author(session: Database, author: AuthorSchema) -> Author:
    new_author = Author(**author.model_dump())
    new_author.id = await get_next_sequence(session, 'authors')
    await session.authors.insert_one({
        '_id': new_author.id,
        'name': new_author.name,
    })
    return new_author


async def get_author_by_id(session: Database, author_id: int) -> Author | None:
    doc = await session.authors.find_one({'_id': author_id})
    return author_from_doc(doc) if doc else None


async def get_author_by_name(
    session: Database, author_name: str
) -> Author | None:
    doc = await session.authors.find_one({'name': author_name})
    return author_from_doc(doc) if doc else None


async def get_filtered_authors_list(
    session: Database,
    limit: int | None,
    author_name: str | None = None,
    offset: int = 0,
) -> tuple[list[Author], int]:
    query: dict[str, object] = {}
    if author_name:
        query['name'] = {'$regex': re.escape(author_name)}

    total_count = await session.authors.count_documents(query)

    cursor = session.authors.find(query).skip(offset)
    if limit:
        cursor = cursor.limit(limit)

    authors = [author_from_doc(doc) async for doc in cursor]
    return authors, total_count


async def get_authors_ids_list(
    session: Database, author_ids: list[int]
) -> list[int]:
    cursor = session.authors.find({'_id': {'$in': author_ids}}, {'_id': 1})
    return [doc['_id'] async for doc in cursor]


async def update_author_info(
    session: Database,
    author_to_update: Author,
    author_info: AuthorSchema,
) -> Author:
    changes = author_info.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(author_to_update, key, value)
    await session.authors.update_one(
        {'_id': author_to_update.id}, {'$set': changes}
    )
    return author_to_update


async def delete_author(session: Database, author_to_delete: Author) -> None:
    await session.books.delete_many({'author_id': author_to_delete.id})
    await session.authors.delete_one({'_id': author_to_delete.id})


async def delete_authors_batch(
    session: Database, author_ids: list[int]
) -> None:
    await session.books.delete_many({'author_id': {'$in': author_ids}})
    await session.authors.delete_many({'_id': {'$in': author_ids}})
