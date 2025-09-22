from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import re
import docx
import pdfplumber
import os
import asyncio
import httpx
from typing import List, Tuple

router = APIRouter()

# --- Config from env ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = os.getenv(
    "OPENROUTER_API_URL", "https://openrouter.ai/v1/chat/completions"
)
# concurrency limit for parallel chunk summarization
CONCURRENCY = int(os.getenv("SUMMARY_CONCURRENCY", "4"))

if not OPENROUTER_API_KEY:
    # If you prefer failing early, raise here. For now, we just warn (or you can raise).
    raise RuntimeError("OPENROUTER_API_KEY not set in environment")

# --- Request models ---
class SummarizeRequest(BaseModel):
    content: str
    # optional: preferred summary length or style
    length: str = "concise"  # 'short' / 'concise' / 'detailed'


# --- Helper Functions ---
def clean_text(text: str) -> str:
    text = re.sub(r"\r\n", "\n", text)  # normalize newlines
    text = re.sub(r"\n{2,}", "\n\n", text)  # collapse multiple newlines but preserve paragraph gap
    text = re.sub(r"[ \t]+", " ", text)  # collapse spaces/tabs
    return text.strip()


def split_by_headings(text: str) -> List[Tuple[str, str]]:
    sections = []
    lines = text.split("\n")
    current_heading = "Untitled Section"
    current_body = ""

    for line in lines:
        stripped = line.strip()
        # Heuristic: heading if ALL CAPS (>=3 chars) or ends with ":" or is Title Case (simple)
        if (
            re.match(r"^[A-Z0-9 \-]{3,}$", stripped)
            or stripped.endswith(":")
            or (stripped and stripped.istitle())
        ):
            if current_body.strip():
                sections.append((current_heading.strip(), current_body.strip()))
            current_heading = stripped or "Untitled Section"
            current_body = ""
        else:
            current_body += line + "\n"

    if current_body.strip():
        sections.append((current_heading.strip(), current_body.strip()))

    return sections


def fine_grained_paragraph_chunker(text: str, max_chunk_words: int = 200) -> List[str]:
    """
    Split by paragraph boundaries into chunks ~max_chunk_words.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        # If adding this paragraph stays within limit, append
        if len((current_chunk + " " + para).split()) <= max_chunk_words:
            current_chunk = (current_chunk + " " + para).strip()
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # if paragraph itself is huge, break it into smaller slices
            if len(para.split()) <= max_chunk_words:
                current_chunk = para
            else:
                words = para.split()
                i = 0
                while i < len(words):
                    slice_words = words[i : i + max_chunk_words]
                    chunks.append(" ".join(slice_words))
                    i += max_chunk_words
                current_chunk = ""
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks


# Simple exponential backoff retry helper
async def _post_with_retries(client: httpx.AsyncClient, url: str, json: dict, headers: dict, retries=3, backoff=1.0):
    for attempt in range(retries):
        try:
            resp = await client.post(url, json=json, headers=headers, timeout=120.0)
            resp.raise_for_status()
            return resp
        except httpx.HTTPStatusError as e:
            # if 429 or 5xx, retry; else raise
            status = e.response.status_code
            if status in (429, 502, 503, 504) and attempt < retries - 1:
                await asyncio.sleep(backoff * (2 ** attempt))
                continue
            raise
        except (httpx.RequestError, httpx.TimeoutException):
            if attempt < retries - 1:
                await asyncio.sleep(backoff * (2 ** attempt))
                continue
            raise


async def summarize_chunk_openrouter(chunk_text: str, length_hint: str = "concise") -> str:
    """
    Summarize a single chunk using OpenRouter.
    length_hint: 'short' | 'concise' | 'detailed'
    """
    # Prompting: be strict to avoid hallucination
    system_prompt = (
        "You are a strict legal summarizer. Summarize only what is present in the text. "
        "Do NOT add external facts, case law, or assumptions. Preserve dates, parties, and explicit citations if present."
    )

    user_prompt = (
        f"Summarize the following text. Keep the summary {length_hint} and focused on facts, issues, and citations:\n\n{chunk_text}"
    )

    payload = {
        "model": "gpt-4o-mini",  # choose the model you have access to on OpenRouter
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 512,
    }

    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"}

    async with httpx.AsyncClient() as client:
        resp = await _post_with_retries(client, OPENROUTER_API_URL, payload, headers)
        data = resp.json()
        # adapt to response structure if different
        # expected: data["choices"][0]["message"]["content"]
        try:
            return data["choices"][0]["message"]["content"].strip()
        except Exception:
            # fallback if structure differs
            return data.get("result", "").strip() or data.get("text", "").strip() or ""


async def combine_summaries_openrouter(summaries: List[str], length_hint: str = "concise") -> str:
    """Combine chunk summaries into a final summary via one OpenRouter call."""
    system_prompt = "You are a concise legal summarizer. Combine the provided chunk summaries into a single polished summary with headings: Facts, Issues, Relief sought (if present), Key citations. Do not introduce new facts."

    # join summaries but cap length to avoid huge prompts; we can chunk again if necessary
    combined_input = "\n\n".join(summaries)
    if len(combined_input) > 40_000:
        # if extremely long, trim from middle — ideally not needed because chunks are summaries
        combined_input = combined_input[:40_000]

    user_prompt = f"Combine and refine these partial summaries into one cohesive summary ({length_hint}):\n\n{combined_input}"

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 800,
    }

    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        resp = await _post_with_retries(client, OPENROUTER_API_URL, payload, headers)
        data = resp.json()
        try:
            return data["choices"][0]["message"]["content"].strip()
        except Exception:
            return data.get("result", "").strip() or data.get("text", "").strip() or ""


# --- API Routes ---

@router.post("/summarize")
async def summarize_text(req: SummarizeRequest):
    text = clean_text(req.content)
    if not text:
        raise HTTPException(status_code=400, detail="Empty content")

    # Split by headings, then chunk each section
    sections = split_by_headings(text)
    if not sections:
        # fallback - treat entire doc as one section
        sections = [("Document", text)]

    semaphore = asyncio.Semaphore(CONCURRENCY)
    summarized_sections = []

    async def summarize_section(heading: str, body: str) -> Tuple[str, str]:
        para_chunks = fine_grained_paragraph_chunker(body, max_chunk_words=250)
        # prepare tasks for chunk summaries
        chunk_tasks = []

        async def sem_task(chunk):
            async with semaphore:
                return await summarize_chunk_openrouter(chunk, req.length)

        for chunk in para_chunks:
            chunk_tasks.append(asyncio.create_task(sem_task(chunk)))

        # wait for all chunk summaries
        chunk_summaries = []
        for t in asyncio.as_completed(chunk_tasks):
            try:
                res = await t
                if res:
                    chunk_summaries.append(res)
            except Exception as e:
                # if one chunk fails, continue — include a small placeholder
                chunk_summaries.append("[chunk summary failed]")
                # optionally log error
                print("Chunk summarization error:", e)

        # combine chunk summaries
        final_section_summary = await combine_summaries_openrouter(chunk_summaries, req.length)
        return heading, final_section_summary

    # run sections sequentially or parallel depending on size; we'll run sequentially to moderate cost
    for heading, body in sections:
        heading, sec_summary = await summarize_section(heading, body)
        summarized_sections.append(f"{heading}:\n{sec_summary}\n")

    final_summary = "\n".join(summarized_sections)
    # optional safety: if final_summary is empty for some reason, return a fallback
    if not final_summary.strip():
        raise HTTPException(status_code=500, detail="Summarization failed")

    return {"summary": final_summary}


@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    if file.content_type not in [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = ""

    if file.content_type == "application/pdf":
        # pdfplumber expects a file-like object; file.file is a SpooledTemporaryFile
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    content += page_text + "\n\n"

    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(file.file)
        for para in doc.paragraphs:
            # preserve paragraphs
            if para.text and para.text.strip():
                content += para.text + "\n\n"

    elif file.content_type == "text/plain":
        content = (await file.read()).decode("utf-8")

    content = clean_text(content)
    return {"content": content.strip()}
