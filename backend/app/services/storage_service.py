import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

class StorageService:
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.upload_dir = Path(settings.STORAGE_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file: UploadFile) -> str:
        # Validate file format and size
        if not file.filename.lower().endswith((".pdf", ".txt", ".docx")):
            raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are accepted.")

        file_id = f"{uuid.uuid4().hex}_{file.filename}"
        dest_path = self.upload_dir / file_id

        # Stream save
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File size exceeds maximum allowable limit of 10MB.")

        with open(dest_path, "wb") as f:
            f.write(content)

        return str(dest_path)

storage_service = StorageService()
