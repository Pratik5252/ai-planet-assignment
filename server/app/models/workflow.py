from sqlmodel import SQLModel, Field, JSON, Column
from typing import Optional, Dict, List, Any
from datetime import datetime
from .base import BaseModel


class Workflow(BaseModel, table=True):
    __tablename__ = "workflows"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True, description="Name of the workflow")
    description: Optional[str] = Field(
        default=None, max_length=1024, description="Description of the workflow"
    )

    nodes: List[Dict[str, Any]] = Field(
        default=[], sa_column=Column(JSON), description="List of nodes in the workflow"
    )
    edges: List[Dict[str, Any]] = Field(
        default=[], sa_column=Column(JSON), description="List of edges in the workflow"
    )

    is_active: bool = Field(default=True,description="Is the workflow active?")
    

