from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.main import api_router
from src.core.settings import settings
from src.schemas.base import Message

app = FastAPI(title='Findle API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['Authorization', 'Content-Type'],
)

app.include_router(api_router)


@app.get('/')
async def home_root() -> Message:
    return Message(message='Findle API')
