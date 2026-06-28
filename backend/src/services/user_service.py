from datetime import datetime, timezone

from src.core.database import Database, get_next_sequence, user_from_doc
from src.core.security import get_password_hash
from src.models import User
from src.schemas.users import (
    SuperUserRequestCreate,
    SuperUserRequestUpdate,
    UserRequestCreate,
    UserRequestUpdate,
)


async def add_user(
    session: Database,
    user: SuperUserRequestCreate | UserRequestCreate,
) -> User:
    hashed_password = get_password_hash(user.password)

    user_attrs = user.model_dump(exclude={'password'})
    new_user = User(**user_attrs, password_hash=hashed_password)
    new_user.id = await get_next_sequence(session, 'users')
    new_user.created_at = datetime.now(timezone.utc)

    doc = new_user.to_dict()
    doc['_id'] = doc.pop('id')
    await session.users.insert_one(doc)
    return new_user


async def get_user(
    session: Database,
    user_email: str | None = None,
    username: str | None = None,
) -> User | None:
    doc = await session.users.find_one({
        '$or': [{'username': username}, {'email': user_email}]
    })
    return user_from_doc(doc) if doc else None


async def get_user_by_id(session: Database, user_id: int) -> User | None:
    doc = await session.users.find_one({'_id': user_id})
    return user_from_doc(doc) if doc else None


async def get_users_list(
    session: Database, limit: int, offset: int
) -> list[User]:
    cursor = session.users.find().skip(offset).limit(limit)
    return [user_from_doc(doc) async for doc in cursor]


async def update_user_info(
    session: Database,
    user_info: SuperUserRequestUpdate | UserRequestUpdate,
    user_to_update: User,
) -> User:
    changes = user_info.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(user_to_update, key, value)
    user_to_update.updated_at = datetime.now(timezone.utc)

    changes['updated_at'] = user_to_update.updated_at
    await session.users.update_one(
        {'_id': user_to_update.id}, {'$set': changes}
    )
    return user_to_update


async def delete_user(session: Database, user_to_delete: User) -> None:
    await session.users.delete_one({'_id': user_to_delete.id})


async def change_password(
    session: Database, user_to_update: User, password: str
) -> User:
    user_to_update.password_hash = get_password_hash(password)
    await session.users.update_one(
        {'_id': user_to_update.id},
        {'$set': {'password_hash': user_to_update.password_hash}},
    )
    return user_to_update
