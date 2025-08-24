from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from openai import OpenAI
import os
import json
import re
from typing import List, Dict
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # one level up from routes
file_path = os.path.join(BASE_DIR, "data", "drafts.json")

router = APIRouter(prefix="/docs")

# --- Cached Data and Models (Initialized on startup) ---

# Initialize embedding model once
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Load LLM client
llm_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# This list will hold our templates with their pre-computed embeddings
TEMPLATES_WITH_EMBEDDINGS: List[Dict] = []
# This will hold the original template data, keyed by slug for easy access
ORIGINAL_TEMPLATES: Dict[str, Dict] = {}

def clean_legal_draft(text: str) -> str:
    
    # Remove asterisks around words (bold/italic in markdown)
    cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # bold
    cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)   # italic
    
    # Remove any heading lines (like ### Key Adaptations or ---)
    cleaned = re.sub(r'^\s*#{1,6}\s.*$', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^---$', '', cleaned, flags=re.MULTILINE)
    
    # Trim trailing and leading whitespace of each line
    cleaned = '\n'.join(line.rstrip() for line in cleaned.splitlines())
    
    # Optionally: collapse multiple blank lines to max one
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    return cleaned.strip()

def load_and_embed_templates():
    """
    Loads templates from JSON, pre-computes their embeddings,
    and caches them in memory. This function runs once on startup.
    """
    global TEMPLATES_WITH_EMBEDDINGS, ORIGINAL_TEMPLATES
    print("Loading and embedding templates...")
    try:

        with open(file_path, "r", encoding="utf-8") as f:
            draft_templates = json.load(f)
        
        for draft in draft_templates:
            searchable_content = draft["title"] + " " + draft.get("description", "")
            embedding = embedder.encode(searchable_content, convert_to_tensor=True)
            
            TEMPLATES_WITH_EMBEDDINGS.append({
                "slug": draft["slug"],
                "title": draft["title"],
                "description": draft.get("description", ""),
                
                "embedding": embedding
            })
            ORIGINAL_TEMPLATES[draft["slug"]] = draft

        print(f"Successfully loaded and embedded {len(TEMPLATES_WITH_EMBEDDINGS)} templates.")
        print("Templates loaded into memory:", len(TEMPLATES_WITH_EMBEDDINGS))
    except Exception as e:
        print(f"Error loading templates: {e}")

load_and_embed_templates()


# --- Pydantic Models ---

class DraftRequest(BaseModel):
    situation: str

class SearchRequest(BaseModel):
    query: str

def extract_placeholders(text: str):
    return list(set(re.findall(r"{{(.*?)}}", text)))


# --- API Endpoints ---

@router.post("/search")
async def search_drafts(request: SearchRequest):
    """
    Performs a semantic search on the pre-embedded templates and returns a ranked list.
    """
    query = request.query.strip()
    if not query:
        return []

    query_embedding = embedder.encode(query, convert_to_tensor=True)
    
    scored_drafts = []
    print("\n--- SEARCHING ---") # Added for clarity
    for draft in TEMPLATES_WITH_EMBEDDINGS:
        score = util.pytorch_cos_sim(query_embedding, draft["embedding"]).item()
        
        # --- THIS IS THE NEW DEBUGGING LINE ---
        print(f"Query: '{query}' | Template: '{draft['title']}' | Score: {score:.4f}")
        
        if score > 0.25: # Suggestion threshold
            scored_drafts.append({
                "score": score,
                "title": draft["title"],
                "description": draft["description"],
                "slug": draft["slug"]
            })

    return sorted(scored_drafts, key=lambda x: x["score"], reverse=True)[:3]

@router.post("/generate-draft")
async def generate_draft(request: DraftRequest):
    situation = request.situation.strip()
    if not situation:
        raise HTTPException(status_code=400, detail="Situation is required.")

    query_embedding = embedder.encode(situation, convert_to_tensor=True)

    best_match_slug, best_score = None, -1
    threshold = 0.25
    for draft in TEMPLATES_WITH_EMBEDDINGS:
        score = util.pytorch_cos_sim(query_embedding, draft["embedding"]).item()
        if score > best_score:
            best_score, best_match_slug = score, draft["slug"]

    if best_score < threshold or best_match_slug is None:
        return JSONResponse(
            content={"message": "No relevant draft found. Please describe your situation more clearly."},
            status_code=404
        )
    
    best_match = ORIGINAL_TEMPLATES.get(best_match_slug)
    if not best_match:
        raise HTTPException(status_code=500, detail="Internal error: Template data not found.")

    prompt = f"""
You are a legal drafting assistant. A user has described their situation.

Rewrite the following draft template to match the user's situation **without removing or adding any placeholders** (e.g., {{{{tenantName}}}}, {{{{dueDate}}}}). Just adapt the wording. Don't add anything at last

### User Situation:
{repr(situation)}

### Template:
{best_match['body']}

### Rewritten Draft:
"""

    try:
        response = llm_client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            top_p=0.95
        )
        rewritten_body = response.choices[0].message.content.strip()
        split_markers = ['---', '### Key Adaptations:']
        for marker in split_markers:
            if marker in rewritten_body:
                rewritten_body = rewritten_body.split(marker)[0].strip()
                break
        rewritten_body = clean_legal_draft(rewritten_body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    return {
        "slug": best_match["slug"],
        "title": best_match["title"],
        "body": rewritten_body,
        "placeholders": extract_placeholders(rewritten_body),
    }
