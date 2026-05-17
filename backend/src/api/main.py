from fastapi import APIRouter

from src.api.routes import auth, authors, books, superuser, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(
    superuser.router, prefix='/superuser', tags=['superuser']
)
api_router.include_router(users.router, prefix='/users', tags=['users'])
api_router.include_router(authors.router, prefix='/authors', tags=['authors'])
api_router.include_router(books.router, prefix='/books', tags=['books'])
