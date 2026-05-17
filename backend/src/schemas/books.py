import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class BookSchema(BaseModel):
    title: str
    year: int = Field(gt=0)
    author_id: int = Field(gt=0)
    price: float | None = Field(default=None, ge=0)

    @field_validator('title')
    def validate_name(cls, v: str) -> str:
        v = v.lower().strip()
        return re.sub(r'\s+', ' ', v)

    @field_validator('year')
    @classmethod
    def year_must_be_valid(cls, v: int) -> int:
        current_year = datetime.now().year
        if v < 1 or v > current_year:
            raise ValueError(f'Year must be between 1 and {current_year}')
        return v


class BookPublic(BaseModel):
    id: int
    title: str
    year: int
    price: float | None = None
    author: str


class BookResponseCreate(BookPublic):
    author_id: int


class BookUpdate(BaseModel):
    year: int = Field(gt=0)
    price: float | None = Field(default=None, ge=0)

    @field_validator('year')
    @classmethod
    def year_must_be_valid(cls, v: int) -> int:
        current_year = datetime.now().year
        if v < 1 or v > current_year:
            raise ValueError(f'Year must be between 1 and {current_year}')
        return v


class BookList(BaseModel):
    books: list[BookPublic]
    total_results: int


class DeleteBooksBulk(BaseModel):
    ids: list[int]
