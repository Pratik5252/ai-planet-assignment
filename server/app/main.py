import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import upload_file, workflow_execution, workflow
from app.database import create_db_and_tables


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_file.router)
app.include_router(workflow_execution.router)
app.include_router(workflow.router)


@app.on_event("startup")
async def startup_event():
    print("🚀 Starting AI Workflow Builder...")
    create_db_and_tables()
    print("✅ Application started successfully!")
