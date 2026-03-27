"""replace sdg_name with sdg_card_id and add attempts to user_activity

Revision ID: a1b2c3d4e5f6
Revises: 18ca4a77155b
Create Date: 2026-02-23 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "18ca4a77155b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # activities: swap sdg_name (string FK) for sdg_card_id (integer FK) #
    # ------------------------------------------------------------------ #
    with op.batch_alter_table("activities") as batch_op:
        batch_op.add_column(sa.Column("sdg_card_id", sa.Integer(), nullable=True))

    # Populate sdg_card_id from the sdg_cards table using the existing sdg_name value
    op.execute(
        """
        UPDATE activities
        SET sdg_card_id = (
            SELECT card_id FROM sdg_cards WHERE sdg_cards.sdg_name = activities.sdg_name
        )
        """
    )

    with op.batch_alter_table("activities") as batch_op:
        batch_op.alter_column("sdg_card_id", nullable=False)
        batch_op.drop_column("sdg_name")

    # ------------------------------------------------------------------ #
    # user_activity: add attempts column                                  #
    # ------------------------------------------------------------------ #
    with op.batch_alter_table("user_activity") as batch_op:
        batch_op.add_column(
            sa.Column("attempts", sa.Integer(), nullable=False, server_default="0")
        )


def downgrade() -> None:
    # Remove attempts from user_activity
    with op.batch_alter_table("user_activity") as batch_op:
        batch_op.drop_column("attempts")

    # Restore sdg_name on activities
    with op.batch_alter_table("activities") as batch_op:
        batch_op.add_column(sa.Column("sdg_name", sa.String(length=255), nullable=True))

    op.execute(
        """
        UPDATE activities
        SET sdg_name = (
            SELECT sdg_name FROM sdg_cards WHERE sdg_cards.card_id = activities.sdg_card_id
        )
        """
    )

    with op.batch_alter_table("activities") as batch_op:
        batch_op.alter_column("sdg_name", nullable=False)
        batch_op.create_foreign_key(
            "fk_activities_sdg_name",
            "sdg_cards",
            ["sdg_name"],
            ["sdg_name"],
        )
        batch_op.drop_constraint("fk_activities_sdg_card_id", type_="foreignkey")
        batch_op.drop_column("sdg_card_id")
