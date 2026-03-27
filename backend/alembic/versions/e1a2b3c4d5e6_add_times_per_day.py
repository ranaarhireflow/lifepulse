"""add times_per_day to trackers

Revision ID: e1a2b3c4d5e6
Revises: d50bcfb96f0a
Create Date: 2026-03-27
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e1a2b3c4d5e6'
down_revision: Union[str, None] = 'd50bcfb96f0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trackers', sa.Column('times_per_day', sa.Integer(), nullable=True, server_default='1'))
    op.execute("UPDATE trackers SET times_per_day = 1 WHERE times_per_day IS NULL")


def downgrade() -> None:
    op.drop_column('trackers', 'times_per_day')
