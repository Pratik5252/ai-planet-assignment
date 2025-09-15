import os
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from ..services.document_service import process_docs


router = APIRouter(prefix="/api", tags=["files"])


@router.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    try:
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(file.file.read())
        process_docs(temp_file_path)
        os.remove(temp_file_path)
        return JSONResponse(
            content={"message": "File processed successfully"}, status_code=200
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
