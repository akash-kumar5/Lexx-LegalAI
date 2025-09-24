# server/routes/docs_router.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
import os
import json
import re
from typing import List, Dict, Optional
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # one level up from routes
file_path = os.path.join(BASE_DIR, "data", "drafts.json")

router = APIRouter(prefix="/docs")

# --- LLM / Embeddings client (OpenRouter) ---
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_KEY:
    print("Warning: OPENROUTER_API_KEY not set. LLM/Embeddings calls will fail if attempted.")

llm_client: Optional[OpenAI] = None
if OPENROUTER_KEY:
    llm_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)

# --- In-memory caches ---
# Each template: { "slug":..., "title":..., "description":..., "body":..., "embedding": [floats] (optional) }
TEMPLATES: List[Dict] = []
TEMPLATE_BY_SLUG: Dict[str, Dict] = {}
EMBEDDING_CACHE: Dict[str, List[float]] = {}  # slug -> embedding list

# --- Helpers ---


def clean_legal_draft(text: str) -> str:
    # Remove bold/italic markdown
    cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)
    # Remove headings / separators
    cleaned = re.sub(r'^\s*#{1,6}\s.*$', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^---$', '', cleaned, flags=re.MULTILINE)
    cleaned = '\n'.join(line.rstrip() for line in cleaned.splitlines())
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()


def extract_placeholders(text: str) -> List[str]:
    return list(set(re.findall(r"{{(.*?)}}", text)))


def safe_load_templates():
    global TEMPLATES, TEMPLATE_BY_SLUG
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            drafts = json.load(f)
    except Exception as e:
        print(f"Error loading drafts.json: {e}")
        drafts = []

    for draft in drafts:
        slug = draft.get("slug")
        tpl = {
            "slug": slug,
            "title": draft.get("title", ""),
            "description": draft.get("description", ""),
            "body": draft.get("body", "")
        }
        TEMPLATES.append(tpl)
        if slug:
            TEMPLATE_BY_SLUG[slug] = tpl

    print(f"Loaded {len(TEMPLATES)} templates.")


def cos_sim(a: List[float], b: List[float]) -> float:
    """
    Cosine similarity for two 1-D float lists
    """
    if a is None or b is None:
        return -1.0
    a_arr = np.array(a, dtype=np.float32)
    b_arr = np.array(b, dtype=np.float32)
    if a_arr.size == 0 or b_arr.size == 0 or a_arr.shape != b_arr.shape:
        return -1.0
    denom = (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))
    if denom == 0:
        return -1.0
    return float(np.dot(a_arr, b_arr) / denom)


def get_embedding_for_text(text: str) -> Optional[List[float]]:
    """
    Use OpenRouter/OpenAI embeddings API to get embedding for a single text.
    Returns a plain Python list of floats or None on failure.
    """
    if llm_client is None:
        print("Embeddings client not configured.")
        return None
    try:
        # model name can be changed to whichever is supported in your OpenRouter plan
        resp = llm_client.embeddings.create(model="text-embedding-3-small", input=text)
        # response may be object-like or dict-like
        if hasattr(resp, "data") and len(resp.data) > 0:
            emb = resp.data[0].embedding
            return list(emb)
        elif isinstance(resp, dict) and "data" in resp and len(resp["data"]) > 0:
            return list(resp["data"][0]["embedding"])
        else:
            print("Unexpected embeddings response:", type(resp))
            return None
    except Exception as e:
        print("Embedding request failed:", e)
        return None


def get_cached_template_embedding(slug: str) -> Optional[List[float]]:
    # return cached embedding if exists, else compute and cache
    if slug in EMBEDDING_CACHE:
        return EMBEDDING_CACHE[slug]
    tpl = TEMPLATE_BY_SLUG.get(slug)
    if not tpl:
        return None
    # Compute embedding on first request (lazy)
    text = (tpl.get("title", "") + " " + tpl.get("description", "")).strip()
    if not text:
        text = tpl.get("body", "")[:1000]  # fallback
    emb = get_embedding_for_text(text)
    if emb:
        EMBEDDING_CACHE[slug] = emb
    return emb


# --- Initialize templates (no heavy model load) ---
safe_load_templates()


# --- Pydantic Models ---
class DraftRequest(BaseModel):
    situation: str


class SearchRequest(BaseModel):
    query: str


# --- Endpoints ---


@router.post("/search")
async def search_drafts(request: SearchRequest):
    query = (request.query or "").strip()
    if not query:
        return []

    # Get embedding for query
    query_emb = get_embedding_for_text(query)
    if query_emb is None:
        # Embedding failure — return basic keyword matches as fallback
        results = []
        ql = query.lower()
        for tpl in TEMPLATES:
            combined = (tpl.get("title", "") + " " + tpl.get("description", "") + " " + tpl.get("body", "")).lower()
            if ql in combined:
                results.append({"score": 0.0, "title": tpl["title"], "description": tpl["description"], "slug": tpl["slug"]})
        return results[:3]

    scored = []
    for tpl in TEMPLATES:
        slug = tpl.get("slug")
        emb = get_cached_template_embedding(slug)
        if emb is None:
            continue
        score = cos_sim(query_emb, emb)
        # debug threshold; choose appropriate cutoff
        if score > 0.20:
            scored.append({"score": score, "title": tpl.get("title", ""), "description": tpl.get("description", ""), "slug": slug})

    scored_sorted = sorted(scored, key=lambda x: x["score"], reverse=True)
    return scored_sorted[:3]


@router.post("/generate-draft")
async def generate_draft(request: DraftRequest):
    situation = (request.situation or "").strip()
    if not situation:
        raise HTTPException(status_code=400, detail="Situation is required.")

    # compute query embedding
    query_emb = get_embedding_for_text(situation)
    # find best template by similarity
    best_score = -1.0
    best_slug = None
    if query_emb is not None:
        for tpl in TEMPLATES:
            slug = tpl.get("slug")
            emb = get_cached_template_embedding(slug)
            if emb is None:
                continue
            score = cos_sim(query_emb, emb)
            if score > best_score:
                best_score = score
                best_slug = slug

    # fallback: keyword match if embeddings not available or score too low
    threshold = 0.2
    if best_slug is None or best_score < threshold:
        # try naive substring match
        ql = situation.lower()
        candidate = None
        for tpl in TEMPLATES:
            combined = (tpl.get("title", "") + " " + tpl.get("description", "") + " " + tpl.get("body", "")).lower()
            if ql in combined:
                candidate = tpl
                break
        if candidate:
            best_slug = candidate.get("slug")
            best_score = 0.0

    if not best_slug:
        return JSONResponse(content={"message": "No relevant draft found. Please describe your situation more clearly."}, status_code=404)

    best_match = TEMPLATE_BY_SLUG.get(best_slug)
    if not best_match:
        raise HTTPException(status_code=500, detail="Template data not found.")

    # Build prompt and call LLM
    prompt = f"""
You are a legal drafting assistant. A user has described their situation.

Rewrite the following draft template to match the user's situation **without removing or adding any placeholders** (e.g., {{{{tenantName}}}}, {{{{dueDate}}}}). Just adapt the wording. Don't add anything at last

### User Situation:
{repr(situation)}

### Template:
{best_match.get('body')}

### Rewritten Draft:
"""

    if llm_client is None:
        raise HTTPException(status_code=500, detail="LLM client not configured on server.")

    try:
        response = llm_client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            top_p=0.95
        )
        # Extract assistant text safely
        assistant_text = ""
        if hasattr(response, "choices") and len(response.choices) > 0:
            ch0 = response.choices[0]
            if getattr(ch0, "message", None) and getattr(ch0.message, "content", None):
                assistant_text = str(ch0.message.content)
            elif isinstance(ch0, dict) and "message" in ch0 and "content" in ch0["message"]:
                assistant_text = str(ch0["message"]["content"])
            elif "text" in ch0:
                assistant_text = str(ch0["text"])
        elif isinstance(response, dict):
            if "choices" in response and len(response["choices"]) > 0:
                c0 = response["choices"][0]
                assistant_text = (c0.get("message") or {}).get("content") or c0.get("text") or ""

        rewritten_body = assistant_text.strip()
        # strip after any split markers
        for marker in ['---', '### Key Adaptations:']:
            if marker in rewritten_body:
                rewritten_body = rewritten_body.split(marker)[0].strip()
                break
        rewritten_body = clean_legal_draft(rewritten_body)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    return {
        "slug": best_match.get("slug"),
        "title": best_match.get("title"),
        "body": rewritten_body,
        "placeholders": extract_placeholders(rewritten_body),
    }
