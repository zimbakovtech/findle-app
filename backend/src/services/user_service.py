from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import get_password_hash
from src.models import User
from src.schemas.users import (
    SuperUserRequestCreate,
    SuperUserRequestUpdate,
    UserRequestCreate,
    UserRequestUpdate,
)


async def add_user(
    session: AsyncSession, user: SuperUserRequestCreate | UserRequestCreate
) -> User:
    hashed_password = get_password_hash(user.password)
    del user.password

    user_attrs = user.model_dump()
    user_attrs['password_hash'] = hashed_password
    new_user = User(**user_attrs)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user


async def get_user(
    session: AsyncSession,
    user_email: str | None = None,
    username: str | None = None,
) -> User | None:
    return await session.scalar(
        select(User).where(
            (User.username == username) | (User.email == user_email)
        )
    )


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.scalar(select(User).where(User.id == user_id))


async def get_users_list(session: AsyncSession, limit: int, offset: int) -> list[User]:
    users_db = await session.scalars(select(User).offset(offset).limit(limit))
    return list(users_db.all())


async def update_user_info(
    session: AsyncSession,
    user_info: SuperUserRequestUpdate | UserRequestUpdate,
    user_to_update: User,
) -> User:
    for key, value in user_info.model_dump(exclude_unset=True).items():
        setattr(user_to_update, key, value)
    session.add(user_to_update)
    await session.commit()
    await session.refresh(user_to_update)
    return user_to_update


async def delete_user(session: AsyncSession, user_to_delete: User) -> None:
    await session.delete(user_to_delete)
    await session.commit()


async def change_password(
    session: AsyncSession, user_to_update: User, password: str
) -> User:
    user_to_update.password_hash = get_password_hash(password)
    session.add(user_to_update)
    await session.commit()
    await session.refresh(user_to_update)
    return user_to_update
