from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
# ALDWF3QRk15zJHPV

class Timestamp(SQLModel):
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="When the record was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the record was last updated",
    )
    
class BaseModel(Timestamp):
    pass
