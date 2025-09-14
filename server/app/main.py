import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import upload_file, workflow


app = FastAPI()

app.include_router(upload_file.router, prefix="/api", tags=["files"])
app.include_router(workflow.router, prefix="/api/workflow", tags=["workflow"])
