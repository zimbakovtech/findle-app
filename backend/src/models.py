from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional


@dataclass
class User:
    username: str
    email: str
    password_hash: str
    id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_superuser: bool = False
    is_active: bool = True
    is_verified: bool = False
    google_sub: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_superuser': self.is_superuser,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'google_sub': self.google_sub,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }


@dataclass
class Author:
    name: str
    id: Optional[int] = None


@dataclass
class Book:
    title: str
    year: int
    author_id: int
    id: Optional[int] = None
    price: Optional[float] = None
    # Populated relationship — never persisted to the document.
    author: Optional[Author] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            'id': self.id,
            'year': self.year,
            'title': self.title,
            'author_id': self.author_id,
            'price': self.price,
        }
