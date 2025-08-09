from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from openai import OpenAI
import os
from fastapi.responses import JSONResponse
import json
import re

router = APIRouter()

# Initialize embedding model once
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Load LLM client (OpenRouter)
llm_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Load templates
with open("data/drafts.json", "r") as f:
    draft_templates = json.load(f)  # [{slug, title, body, placeholders}]


class DraftRequest(BaseModel):
    situation: str


def extract_placeholders(text: str):
    return list(set(re.findall(r"{{(.*?)}}", text)))


@router.post("/generate-draft")
async def generate_draft(request: DraftRequest):
    situation = request.situation.strip()
    if not situation:
        raise HTTPException(status_code=400, detail="Situation is required.")

    query_embedding = embedder.encode(situation, convert_to_tensor=True)

    # Find best match
    best_match, best_score = None, -1
    threshold = 0.45
    for draft in draft_templates:
        title_embedding = embedder.encode(draft["title"] + draft["description"] + draft["body"], convert_to_tensor=True)
        score = util.pytorch_cos_sim(query_embedding, title_embedding).item()
        if score > best_score:
            best_score, best_match = score, draft

    if best_match < threshold or best_match is None:
        return JSONResponse(
            content={"message": "No relevant draft found. Try describing your situation better."},
            status_code=404
        )
    # Prepare prompt for LLM
    prompt = f"""
You are a legal drafting assistant. A user has described their situation.

Rewrite the following draft template to match the user's situation **without removing or adding any placeholders** (e.g., {{tenantName}}, {{dueDate}}). Just adapt the wording.

### User Situation:
{repr(situation)}

### Template:
{best_match['body']}

### Rewritten Draft:
"""

    # Call LLM
    try:
        response = llm_client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            top_p=0.95
        )
        rewritten_body = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    return {
        "slug": best_match["slug"],
        "title": best_match["title"],
        "body": rewritten_body,
        "placeholders": extract_placeholders(rewritten_body),
    }
