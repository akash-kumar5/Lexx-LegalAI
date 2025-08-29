from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import re
import docx
import pdfplumber

router = APIRouter()

class SummarizeRequest(BaseModel):
    content: str

# Load BART Summarization Pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# --- Helper Functions ---

def clean_text(text: str) -> str:
    text = re.sub(r'\n+', '\n', text)  # collapse multiple newlines
    text = re.sub(r'\s+', ' ', text)   # collapse spaces
    return text.strip()


def split_by_headings(text: str):
    sections = []
    lines = text.split("\n")
    current_heading = "Untitled Section"
    current_body = ""

    for line in lines:
        # Heuristic: Line is heading if it's in ALL CAPS, ends with ':' or is Title Case
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

def fine_grained_paragraph_chunker(text: str, max_chunk_words=200):
    """
    Splits text into chunks of ~200 words using paragraph boundaries.
    """
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len((current_chunk + " " + para).split()) <= max_chunk_words:
            current_chunk += para + " "
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = para + " "

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks

# --- API Routes ---

@router.post("/summarize")
def summarize_text(req: SummarizeRequest):
    sections = split_by_headings(req.content)
    summarized_sections = []

    for heading, body in sections:
        para_chunks = fine_grained_paragraph_chunker(body)
        chunk_summaries = []
        for chunk in para_chunks:
            prompted_chunk = f"Summarize the following strictly based on the text. Do NOT add external knowledge:\n\n{chunk}"
            summary = summarizer(prompted_chunk, max_length=150, min_length=80, do_sample=False)[0]['summary_text']
            chunk_summaries.append(summary)

        section_summary = "\n\n".join(chunk_summaries)
        summarized_sections.append(f"{heading}:\n{section_summary}\n")

    final_summary = "\n".join(summarized_sections)

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
        
    content = clean_text(content)

    return {"content": content.strip()}
