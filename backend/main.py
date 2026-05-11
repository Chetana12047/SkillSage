from fastapi import FastAPI, UploadFile, File
import shutil
import os

from services.pdf_parser import extract_text_from_pdf

app = FastAPI()

os.makedirs("temp", exist_ok=True)

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):

    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(file_path)

    return {
        "text": text
    }