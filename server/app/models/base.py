from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional

# ALDWF3QRk15zJHPV


def utc_now():
    """Helper function to get current UTC time with timezone info"""
    return datetime.now(timezone.utc)


class Timestamp(SQLModel):
    created_at: datetime = Field(
        default_factory=utc_now, description="When the record was created"
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        description="When the record was last updated",
    )


class BaseModel(Timestamp):
    pass
