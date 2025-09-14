# app/api/workflow.py
from fastapi import APIRouter
from pydantic import BaseModel
from ..services.workflow_service import execute_simple_workflow

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/execute")
async def execute_workflow(request: QueryRequest):
    """Execute simple workflow: User Query → Knowledge → LLM → Output"""
    result = execute_simple_workflow(request.query)
    return result


@router.get("/test")
async def test_workflow():
    """Test endpoint with a sample query"""
    result = execute_simple_workflow("What is Machine Learning ?")
    return result
