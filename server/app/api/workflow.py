from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Dict, Any

from app.models.workflow import Workflow
from app.database import get_session
from app.services.workflow_manage_service import WorkflowManageService

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow_data: Dict[str, Any], session: Session = Depends(get_session)
):
    try:
        service = WorkflowManageService(session)
        name = workflow_data.get("name")
        description = workflow_data.get("description")

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workflow name is required",
            )

        workflow = service.create_workflow(name=name, description=description)
        return workflow
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating workflow: {str(e)}",
        )


@router.get("/", response_model=List[Workflow])
async def get_all_workflows(session: Session = Depends(get_session)):
    try:
        service = WorkflowManageService(session)
        workflows = service.get_all_workflows()
        print(workflows)
        return workflows
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflows: {str(e)}",
        )


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: int, session: Session = Depends(get_session)):
    try:
        service = WorkflowManageService(session)
        workflow = service.get_workflow_by_id(workflow_id)

        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow with id {workflow_id} not found",
            )
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflow: {str(e)}",
        )


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: int,
    workflow_data: Dict[str, Any],
    session: Session = Depends(get_session),
):
    try:
        service = WorkflowManageService(session)

        name = workflow_data.get("name")
        description = workflow_data.get("description")
        nodes = workflow_data.get("nodes")
        edges = workflow_data.get("edges")

        workflow = service.update_workflow(
            workflow_id=workflow_id,
            name=name,
            description=description,
            nodes=nodes,
            edges=edges,
        )

        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow with id {workflow_id} not found",
            )
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating workflow: {str(e)}",
        )


@router.put("/{workflow_id}/save", response_model=Workflow)
async def save_workflow(
    workflow_id: int,
    canvas_data: Dict[str, Any],
    session: Session = Depends(get_session),
):
    try:
        service = WorkflowManageService(session)

        nodes = canvas_data.get("nodes")
        edges = canvas_data.get("edges")

        workflow = service.save_workflow_data(
            workflow_id=workflow_id, nodes=nodes, edges=edges
        )

        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow with id {workflow_id} not found",
            )
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving workflow: {str(e)}",
        )
