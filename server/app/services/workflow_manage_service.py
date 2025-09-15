from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone

from app.models.workflow import Workflow
from app.database import get_session


class WorkflowManageService:
    def __init__(self, session: Session):
        self.session = session

    def create_workflow(self, name: str, description: Optional[str] = None) -> Workflow:
        workflow = Workflow(
            name=name,
            description=description,
            nodes=[],
            edges=[],
            is_active=True,
        )

        self.session.add(workflow)
        self.session.commit()
        self.session.refresh(workflow)
        return workflow

    def get_workflow_by_id(self, workflow_id: int) -> Optional[Workflow]:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        return self.session.exec(statement).first()

    def get_all_workflows(self) -> List[Workflow]:
        statement = (
            select(Workflow)
            .where(Workflow.is_active == True)
            .order_by(Workflow.updated_at.desc())
        )
        return self.session.exec(statement).all()

    def update_workflow(
        self,
        workflow_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        nodes: Optional[list] = None,
        edges: Optional[list] = None,
    ) -> Optional[Workflow]:

        workflow = self.get_workflow_by_id(workflow_id)
        if not workflow:
            return None

        if name is not None:
            workflow.name = name
        if description is not None:
            workflow.description = description
        if nodes is not None:
            workflow.nodes = nodes
        if edges is not None:
            workflow.edges = edges

        workflow.updated_at = datetime.now(timezone.utc)

        self.session.add(workflow)
        self.session.commit()
        self.session.refresh(workflow)
        return workflow

    def save_workflow_data(
        self, workflow_id: int, nodes: list, edges: list
    ) -> Optional[Workflow]:
        workflow = self.get_workflow_by_id(workflow_id)
        if not workflow:
            return None

        workflow.nodes = nodes
        workflow.edges = edges
        workflow.updated_at = datetime.now(timezone.utc)

        self.session.add(workflow)
        self.session.commit()
        self.session.refresh(workflow)
        return workflow


def get_workflow_manage_service(session: Session) -> WorkflowManageService:
    return WorkflowManageService(session)
