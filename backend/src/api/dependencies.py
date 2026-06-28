from http import HTTPStatus
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, PyJWTError, decode

from src.core.database import Database, db
from src.core.settings import settings
from src.models import User
from src.services import user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/token')


async def get_session() -> AsyncGenerator[Database, None]:
    yield db  # pragma: no cover


SessionDep = Annotated[Database, Depends(get_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_current_user(session: SessionDep, token: TokenDep) -> User:
    credentials_exception = HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail='Could not validate credentials.',
        headers={'WWW-Authenticate': 'Bearer'},
    )

    try:
        payload = decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email = payload.get('sub')
        if not email:
            raise credentials_exception
    except ExpiredSignatureError:
        raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user_db = await user_service.get_user(session=session, user_email=email)

    if not user_db:
        raise credentials_exception

    return user_db


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Insufficient permissions.',
        )
    return current_user
