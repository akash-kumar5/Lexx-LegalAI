from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from bson import ObjectId
from models import User
from utils.auth_utils import get_current_user
from db import chats_collection
import os
from dotenv import load_dotenv
import chromadb
from datetime import datetime
import tiktoken
import re
import logging
from typing import List

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "../chroma_data")
load_dotenv(".env.local")

MAX_INPUT_TOKENS = 6000
RESPONSE_TOKEN_BUFFER = 1000
MODEL_TOKEN_LIMIT = 64000

# tokenizer
try:
    tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")
except Exception:
    tokenizer = tiktoken.get_encoding("cl100k_base")

def count_tokens(text: str) -> int:
    if not text:
        return 0
    try:
        return len(tokenizer.encode(text))
    except Exception:
        return max(0, len(text) // 4)


router = APIRouter(prefix="/api")

# OpenRouter/OpenAI client (used for both chat and embeddings)
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_KEY:
    logger.warning("OPENROUTER_API_KEY not set. LLM/Embeddings calls will fail if attempted.")

llm_client = None
if OPENROUTER_KEY:
    llm_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY)


# --- Chroma client (keep persistent local DB for retrieval) ---
try:
    chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
    collection = chroma_client.get_collection("legal_docs")
except Exception as e:
    # If Chroma isn't available, set collection to None and fallback later
    logger.exception("Failed to init chroma client; retrieval disabled.")
    collection = None


# --- get_relevant_context using external embeddings (OpenRouter / OpenAI) ---
def get_relevant_context(query: str, top_k: int = 5) -> List[str]:
    """
    Get top-k relevant document chunks using OpenRouter embeddings + Chroma query.
    Falls back to a simple empty list if either embeddings or chroma are unavailable.
    """
    if not query:
        return []

    # require both llm_client and chroma collection
    if llm_client is None or collection is None:
        logger.debug("Embeddings or Chroma not configured; skipping retrieval.")
        return []

    try:
        # Create embedding via OpenRouter (OpenAI SDK wrapper)
        # Model name may vary — use a small embedding model suitable for OpenRouter/OpenAI
        emb_resp = llm_client.embeddings.create(model="text-embedding-3-small", input=query)
        # The SDK may return an object or dict; handle both
        if hasattr(emb_resp, "data") and len(emb_resp.data) > 0:
            query_embedding = emb_resp.data[0].embedding
        elif isinstance(emb_resp, dict) and "data" in emb_resp and len(emb_resp["data"]) > 0:
            query_embedding = emb_resp["data"][0]["embedding"]
        else:
            logger.warning("Unexpected embeddings response shape: %s", type(emb_resp))
            return []

        # Query chroma using the embedding
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas"]
        )
        # results["documents"] typically is a list of lists (one per query)
        docs_for_query = results.get("documents", [])
        if isinstance(docs_for_query, list) and len(docs_for_query) > 0:
            chunks = docs_for_query[0]
            # ensure strings and trim length for safety
            cleaned = [str(c)[:10000] for c in chunks if c]
            return cleaned
        return []
    except Exception as e:
        logger.exception("Failed to retrieve relevant context: %s", e)
        return []


def build_contextual_messages(past_messages, new_prompt, context_text):
    system_msg = {
        "role": "system",
        "content": (
            f"You are a legal assistant specialized in Indian law. "
            f"Today is {datetime.today().strftime('%B %d, %Y')}. "
            f"Respond in a tone that is formal, precise, and easy for a layman to understand. If the user seems confused, explain gently. If it's a professional query, be concise and use legal terms."
            f"Respond factually and clearly using the provided legal context and chat history. "
            f"\n\nContext:\n{context_text.strip()}"
        )
    }

    total_tokens = count_tokens(system_msg["content"]) + count_tokens(new_prompt)
    selected_messages = []

    for msg in reversed(past_messages or []):  # latest messages first
        content = str(msg.get("content", "")) if isinstance(msg, dict) else str(msg)
        msg_tokens = count_tokens(content)
        if total_tokens + msg_tokens > (MAX_INPUT_TOKENS - RESPONSE_TOKEN_BUFFER):
            break
        # preserve role/content shape
        role = msg.get("role", "user") if isinstance(msg, dict) else "user"
        selected_messages.insert(0, {"role": role, "content": content})
        total_tokens += msg_tokens

    return [system_msg] + selected_messages + [{"role": "user", "content": new_prompt}]


# Pydantic Schemas
class ChatRequest(BaseModel):
    prompt: str
    chat_id: str | None = None


class Message(BaseModel):
    role: str
    content: str


def serialize_chat(chat):
    chat["_id"] = str(chat["_id"])
    return chat


# Routes
class TokenCountRequest(BaseModel):
    text: str


@router.post("/count-tokens")
async def count_tokens_api(req: TokenCountRequest):
    return {"tokens": count_tokens(req.text)}


@router.post("/chat")
async def ask_llm(request: ChatRequest, user: User = Depends(get_current_user)):
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt is empty")

        chat_id = request.chat_id

        if not chat_id:
            chat = {"user_id": user.id, "messages": [], "createdAt": datetime.now()}
            result = await chats_collection.insert_one(chat)
            chat_id = str(result.inserted_id)

        # Save User Message
        user_message = {"role": "user", "content": request.prompt}
        await chats_collection.update_one(
            {"_id": ObjectId(chat_id), "user_id": user.id},
            {"$push": {"messages": user_message}}
        )

        # Retrieve relevant context chunks (via OpenRouter embeddings + Chroma)
        context_chunks = get_relevant_context(request.prompt)
        context_text = "\n\n".join(context_chunks)

        # Fetch full chat history
        chat_doc = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
        past_messages = chat_doc.get("messages", []) if chat_doc else []

        # Build token-aware message list
        messages_for_llm = build_contextual_messages(past_messages, request.prompt, context_text)

        # Call LLM (ensure llm_client configured)
        if llm_client is None:
            raise HTTPException(status_code=500, detail="LLM client not configured on server.")

        response = llm_client.chat.completions.create(
            model="x-ai/grok-4-fast:free",
            messages=messages_for_llm,
            temperature=0.6,
            top_p=0.95
        )

        assistant_reply = ""
        try:
            # handle different response shapes safely
            if hasattr(response, "choices") and len(response.choices) > 0:
                choice0 = response.choices[0]
                if getattr(choice0, "message", None) is not None and getattr(choice0.message, "content", None) is not None:
                    assistant_reply = str(choice0.message.content)
                elif isinstance(choice0, dict) and "message" in choice0 and "content" in choice0["message"]:
                    assistant_reply = str(choice0["message"]["content"])
                elif "text" in choice0:
                    assistant_reply = str(choice0["text"])
            elif isinstance(response, dict):
                if "choices" in response and len(response["choices"]) > 0:
                    c0 = response["choices"][0]
                    assistant_reply = (c0.get("message") or {}).get("content") or c0.get("text") or ""
        except Exception:
            logger.exception("Failed to parse LLM response")

        assistant_reply = assistant_reply.strip()
        assistant_reply = re.sub(r'\n\s*\n+', '\n\n', assistant_reply)

        # Save Assistant Response
        assistant_message = {"role": "assistant", "content": assistant_reply}
        await chats_collection.update_one(
            {"_id": ObjectId(chat_id), "user_id": user.id},
            {"$push": {"messages": assistant_message}}
        )

        return {"answer": assistant_reply, "context": context_text, "chat_id": chat_id}

    except Exception as e:
        logger.exception("ask_llm error")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats")
async def get_chats(user: User = Depends(get_current_user)):
    chats = await chats_collection.find({"user_id": user.id}).to_list(length=None)
    return [{
        "_id": str(chat["_id"]),
        "title": f"Chat {str(chat['_id'])[-4:]}",  # Temporary title
        "preview": chat["messages"][0]["content"][:50] if chat.get("messages") else "",
        "createdAt" : chat.get("createdAt")
    } for chat in chats]


@router.get("/chats/{chat_id}")
async def get_chat_messages(chat_id: str, user: User = Depends(get_current_user)):
    chat = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.get("messages", [])

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, user: User = Depends(get_current_user)):
    chat = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")
    await chats_collection.delete_one({"_id": ObjectId(chat_id)})
    return {"success": True}

@router.patch("/chats/{chat_id}")
async def rename_chat(chat_id: str, payload: dict, user: User = Depends(get_current_user)):
    new_title = payload.get("title", "").strip()
    if not new_title:
        raise HTTPException(status_code=400, detail="Title can't be empty.")
    chat = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")
    await chats_collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"title": new_title}}
    )
    return {"success": True}

@router.post("/chats")
async def create_chat(user: User = Depends(get_current_user)):
    chat = {"user_id": user.id, "messages": []}
    result = await chats_collection.insert_one(chat)
    return {"chat_id": str(result.inserted_id)}


@router.post("/chats/{chat_id}/message")
async def add_message(chat_id: str, message: Message, user: User = Depends(get_current_user)):
    update_result = await chats_collection.update_one(
        {"_id": ObjectId(chat_id), "user_id": user.id},
        {"$push": {"messages": message.dict()}}
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "Message added"}

class FileTextRequest(BaseModel):
    text: str

@router.post("/process-file")
async def process_file(request: FileTextRequest, user: User = Depends(get_current_user)):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    token_count = count_tokens(text)
    if token_count > MAX_INPUT_TOKENS:
        return {
            "status": "too_long",
            "message": "File too large, please use summarization.",
            "tokens": token_count
        }

    # If within limits → create a new chat and insert
    chat = {"user_id": user.id, "messages": [{"role": "user", "content": text}], "createdAt": datetime.now()}
    result = await chats_collection.insert_one(chat)

    return {"status": "ok", "chat_id": str(result.inserted_id)}
