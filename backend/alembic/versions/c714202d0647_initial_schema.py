"""initial schema

Revision ID: c714202d0647
Revises:
Create Date: 2026-03-26 16:38:39.145391
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'c714202d0647'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Archive all old tables (NEVER delete data)
    op.execute("ALTER TABLE IF EXISTS custom_trackers RENAME TO custom_trackers_archive")
    op.execute("ALTER TABLE IF EXISTS fcm_tokens RENAME TO fcm_tokens_archive")
    op.execute("ALTER TABLE IF EXISTS logs RENAME TO logs_archive")
    op.execute("ALTER TABLE IF EXISTS users RENAME TO users_archive")

    # Drop old indexes that reference renamed tables
    op.execute("DROP INDEX IF EXISTS idx_custom_trackers_uid")
    op.execute("DROP INDEX IF EXISTS idx_logs_uid_date")

    # Step 2: Create new users table
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('firebase_uid', sa.String(length=128), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('display_name', sa.String(length=255), nullable=True),
    sa.Column('photo_url', sa.String(length=512), nullable=True),
    sa.Column('timezone', sa.String(length=64), server_default='UTC', nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('firebase_uid'),
    )
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)

    # Step 3: Create tracker_templates (no FK deps)
    op.create_table('tracker_templates',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('icon', sa.String(length=64), nullable=True),
    sa.Column('color', sa.String(length=7), nullable=True),
    sa.Column('type', sa.Enum('NUMERIC', 'DUAL_NUMERIC', 'BOOLEAN', 'DURATION', 'TIME', 'TEXT', name='trackertype'), nullable=False),
    sa.Column('unit', sa.String(length=32), nullable=True),
    sa.Column('unit_secondary', sa.String(length=32), nullable=True),
    sa.Column('default_behavior', sa.Enum('CARRY_FORWARD', 'ZERO', 'NULL', name='defaultbehavior'), nullable=False),
    sa.Column('category', sa.String(length=64), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )

    # Step 4: Create tables with FK to users
    op.create_table('push_subscriptions',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('endpoint', sa.String(length=512), nullable=False),
    sa.Column('p256dh', sa.String(length=256), nullable=False),
    sa.Column('auth', sa.String(length=256), nullable=False),
    sa.Column('device_label', sa.String(length=128), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'endpoint', name='uq_user_endpoint')
    )

    op.create_table('trackers',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('icon', sa.String(length=64), nullable=True),
    sa.Column('color', sa.String(length=7), nullable=True),
    sa.Column('type', sa.Enum('NUMERIC', 'DUAL_NUMERIC', 'BOOLEAN', 'DURATION', 'TIME', 'TEXT', name='trackertype', create_type=False), nullable=False),
    sa.Column('unit', sa.String(length=32), nullable=True),
    sa.Column('unit_secondary', sa.String(length=32), nullable=True),
    sa.Column('default_behavior', sa.Enum('CARRY_FORWARD', 'ZERO', 'NULL', name='defaultbehavior', create_type=False), nullable=False),
    sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
    sa.Column('archived', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('reminder_enabled', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('min_value', sa.Float(), nullable=True),
    sa.Column('max_value', sa.Float(), nullable=True),
    sa.Column('streak_goal', sa.Integer(), nullable=True),
    sa.Column('target_value', sa.Float(), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )

    # Step 5: Create entries (FK to trackers and users)
    op.create_table('entries',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('tracker_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('value_numeric', sa.Float(), nullable=True),
    sa.Column('value_numeric2', sa.Float(), nullable=True),
    sa.Column('value_boolean', sa.Boolean(), nullable=True),
    sa.Column('value_duration', sa.Integer(), nullable=True),
    sa.Column('value_time', sa.String(length=5), nullable=True),
    sa.Column('value_text', sa.Text(), nullable=True),
    sa.Column('note', sa.Text(), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['tracker_id'], ['trackers.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('tracker_id', 'date', name='uq_tracker_date')
    )
    op.create_index('ix_tracker_date', 'entries', ['tracker_id', 'date'], unique=False)
    op.create_index('ix_user_date', 'entries', ['user_id', 'date'], unique=False)

    # Step 6: Create tracker_alerts (FK to trackers)
    op.create_table('tracker_alerts',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('tracker_id', sa.UUID(), nullable=False),
    sa.Column('alert_time', sa.String(length=5), nullable=False),
    sa.Column('alert_days', postgresql.ARRAY(sa.Integer()), nullable=False),
    sa.Column('label', sa.String(length=128), nullable=True),
    sa.Column('enabled', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['tracker_id'], ['trackers.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop new tables
    op.drop_table('tracker_alerts')
    op.drop_index('ix_user_date', table_name='entries')
    op.drop_index('ix_tracker_date', table_name='entries')
    op.drop_table('entries')
    op.drop_table('trackers')
    op.drop_table('push_subscriptions')
    op.drop_table('tracker_templates')
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')
    op.drop_table('users')

    # Restore archived tables
    op.execute("ALTER TABLE IF EXISTS users_archive RENAME TO users")
    op.execute("ALTER TABLE IF EXISTS logs_archive RENAME TO logs")
    op.execute("ALTER TABLE IF EXISTS fcm_tokens_archive RENAME TO fcm_tokens")
    op.execute("ALTER TABLE IF EXISTS custom_trackers_archive RENAME TO custom_trackers")
