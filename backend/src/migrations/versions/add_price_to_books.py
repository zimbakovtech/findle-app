"""add price to books

Revision ID: a1b2c3d4e5f6
Revises: 4fc0e435a08d
Create Date: 2026-05-17 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '4fc0e435a08d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('books', sa.Column('price', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('books', 'price')
