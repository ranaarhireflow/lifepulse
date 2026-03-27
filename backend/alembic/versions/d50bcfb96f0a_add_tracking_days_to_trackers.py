"""add tracking_days to trackers

Revision ID: d50bcfb96f0a
Revises: 299f5933ebfa
Create Date: 2026-03-27 11:46:01.320634
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'd50bcfb96f0a'
down_revision: Union[str, None] = '299f5933ebfa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trackers', sa.Column('tracking_days', postgresql.ARRAY(sa.Integer()), nullable=True))
    # Set default for existing trackers: all 7 days
    op.execute("UPDATE trackers SET tracking_days = '{1,2,3,4,5,6,7}' WHERE tracking_days IS NULL")


def downgrade() -> None:
    op.drop_column('trackers', 'tracking_days')
