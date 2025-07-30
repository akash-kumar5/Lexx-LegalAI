from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import re
import docx
import pdfplumber

router = APIRouter()

class SummarizeRequest(BaseModel):
    content: str

# Load Summarization Model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Heuristic Heading-Based Splitter
def split_by_headings(text):
    sections = []
    lines = text.split("\n")
    current_heading = "Untitled Section"
    current_body = ""

    for line in lines:
        # Simple heuristic for headings (expand regex as needed)
        if re.match(r'^([A-Z ]{3,}|.*:)$', line.strip()) or line.strip().istitle():
            if current_body.strip():
                sections.append((current_heading.strip(), current_body.strip()))
            current_heading = line.strip()
            current_body = ""
        else:
            current_body += line + " "

    if current_body.strip():
        sections.append((current_heading.strip(), current_body.strip()))

    return sections

def chunk_by_paragraphs(text, max_chunk_words=700):
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len((current_chunk + para).split()) <= max_chunk_words:
            current_chunk += para.strip() + " "
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = para.strip() + " "

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

# Smart Chunker (500-700 words per chunk)
def chunk_section_text(text, max_chunk_words=700):
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_chunk_words):
        chunk = " ".join(words[i:i + max_chunk_words])
        chunks.append(chunk)
    return chunks

@router.post("/summarize")
def summarize_text(req: SummarizeRequest):
    sections = split_by_headings(req.content)
    summarized_sections = []

    for heading, body in sections:
        section_chunks = chunk_by_paragraphs(body)
        chunk_summaries = []

        for chunk in section_chunks:
            summary = summarizer(chunk, max_length=300, min_length=100, do_sample=False)[0]['summary_text']
            chunk_summaries.append(summary)

        section_summary = " ".join(chunk_summaries)
        summarized_sections.append(f"{heading}:\n{section_summary}\n")

    final_summary = "\n".join(summarized_sections)

    # Recursive summarization if entire text is still large
    # if len(final_summary.split()) > 1200:
    #     final_summary = summarizer(final_summary, max_length=300, min_length=150, do_sample=False)[0]['summary_text']

    return {"summary": final_summary}

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    if file.content_type not in [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = ""

    if file.content_type == "application/pdf":
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    content += page_text + "\n"

    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(file.file)
        for para in doc.paragraphs:
            content += para.text + "\n"

    elif file.content_type == "text/plain":
        content = (await file.read()).decode('utf-8')

    return {"content": content.strip()}
