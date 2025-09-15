# app/api/workflow_execution.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ..services.workflow_execution_service import execute_workflow

router = APIRouter(prefix="/api/workflow-execution", tags=["workflow-execution"])


class ExecuteWorkflowRequest(BaseModel):
    user_input: str


class ChatRequest(BaseModel):
    query: str


@router.post("/{workflow_id}/execute")
async def execute_workflow_endpoint(
    workflow_id: int, request: ExecuteWorkflowRequest
) -> Dict[str, Any]:
    """
    Execute a ReactFlow workflow with user input
    This handles flexible patterns: UserQuery → LLM or UserQuery → KnowledgeBase → LLM → Output
    """
    result = execute_workflow(workflow_id, request.user_input)

    if not result.get("success", False):
        raise HTTPException(
            status_code=400, detail=result.get("error", "Workflow execution failed")
        )

    return result


@router.post("/{workflow_id}/validate")
async def validate_workflow(workflow_id: int) -> Dict[str, Any]:
    """
    Validate a workflow structure (Build Stack functionality)
    Checks if workflow has proper node connections and required components
    """
    try:
        # Test execution with a simple query to validate workflow
        result = execute_workflow(workflow_id, "Test validation query")

        return {
            "valid": result.get("success", False),
            "workflow_id": workflow_id,
            "pattern": result.get("workflow_pattern", "Unknown"),
            "nodes_count": result.get("nodes_executed", 0),
            "errors": (
                [] if result.get("success") else [result.get("error", "Unknown error")]
            ),
            "message": (
                "Workflow is valid and ready to execute"
                if result.get("success")
                else "Workflow has validation errors"
            ),
        }

    except Exception as e:
        return {
            "valid": False,
            "workflow_id": workflow_id,
            "errors": [str(e)],
            "message": f"Validation failed: {str(e)}",
        }


@router.post("/{workflow_id}/chat")
async def chat_with_workflow(workflow_id: int, request: ChatRequest) -> Dict[str, Any]:
    """
    Chat with an executed workflow (Chat with Stack functionality)
    This allows ongoing conversation with the workflow context
    """
    result = execute_workflow(workflow_id, request.query)

    if not result.get("success", False):
        raise HTTPException(
            status_code=400, detail=result.get("error", "Chat execution failed")
        )

    # Format response for chat interface
    return {
        "message": result.get("final_response", "No response generated"),
        "workflow_id": workflow_id,
        "query": request.query,
        "context_used": result.get("context_used", False),
        "timestamp": result.get("timestamp"),
        "execution_log": result.get("execution_log", []),
    }


@router.get("/{workflow_id}/debug")
async def debug_workflow(workflow_id: int) -> Dict[str, Any]:
    """Debug endpoint to see workflow data structure"""
    session = None
    try:
        from app.database import get_session
        from app.models.workflow import Workflow

        session = get_session()
        workflow = session.get(Workflow, workflow_id)

        if not workflow:
            return {"error": f"Workflow {workflow_id} not found"}

        return {
            "workflow_id": workflow_id,
            "name": workflow.name,
            "nodes": workflow.nodes,
            "edges": workflow.edges,
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if session:
            session.close()
