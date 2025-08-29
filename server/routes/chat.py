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
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import os
from datetime import datetime
import tiktoken
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "../chroma_data") 
load_dotenv()
MAX_INPUT_TOKENS = 6000
RESPONSE_TOKEN_BUFFER = 1000
MODEL_TOKEN_LIMIT = 64000  

tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")  # Works well for OpenRouter API

def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text))



router = APIRouter(prefix="/api")

llm_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
collection = chroma_client.get_collection("legal_docs")
embedder = SentenceTransformer("BAAI/bge-base-en-v1.5")

def get_relevant_context(query, top_k=5):
    query_embedding = embedder.encode([query])[0]
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas"]
    )
    chunks = results["documents"][0]  # List of top_k chunks
    return chunks

from datetime import datetime

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

    for msg in reversed(past_messages):  # latest messages first
        msg_tokens = count_tokens(msg["content"])
        if total_tokens + msg_tokens > (MAX_INPUT_TOKENS - RESPONSE_TOKEN_BUFFER):
            break
        selected_messages.insert(0, msg)
        total_tokens += msg_tokens

    return [system_msg] + selected_messages + [{"role": "user", "content": new_prompt}]



# Pydantic Schemas
class ChatRequest(BaseModel):
    prompt: str
    chat_id: str | None = None

class Message(BaseModel):
    role: str
    content: str

# Serialize ObjectId
def serialize_chat(chat):
    chat["_id"] = str(chat["_id"])
    return chat

# ---- Routes ---- #

class TokenCountRequest(BaseModel):
    text: str

@router.post("/count-tokens")
async def count_tokens_api(req: TokenCountRequest):
    return {"tokens": count_tokens(req.text)}


@router.post("/chat")
async def ask_llm(request: ChatRequest, user: User = Depends(get_current_user)):
    try:
        chat_id = request.chat_id

        if not chat_id:
            chat = {"user_id": user.id, "messages": [], "createdAt":datetime.now()}
            result = await chats_collection.insert_one(chat)
            chat_id = str(result.inserted_id)

        # Save User Message
        user_message = {"role": "user", "content": request.prompt}
        await chats_collection.update_one(
            {"_id": ObjectId(chat_id), "user_id": user.id},
            {"$push": {"messages": user_message}}
        )
        
        # Retrieve relevant context chunks
        context_chunks = get_relevant_context(request.prompt)
        context_text = "\n\n".join(context_chunks)


        # Call LLM
        # Fetch full chat history
        chat_doc = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
        past_messages = chat_doc.get("messages", []) if chat_doc else []

        # Build token-aware message list
        messages_for_llm = build_contextual_messages(past_messages, request.prompt, context_text)

        # Call LLM
        response = llm_client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=messages_for_llm,
            temperature=0.6,
            top_p=0.95
        )


        assistant_reply = response.choices[0].message.content.strip()
        assistant_reply = re.sub(r'\n\s*\n+', '\n\n', assistant_reply)

        # Save Assistant Response
        assistant_message = {"role": "assistant", "content": assistant_reply}
        await chats_collection.update_one(
            {"_id": ObjectId(chat_id), "user_id": user.id},
            {"$push": {"messages": assistant_message}}
        )

        return {"answer": assistant_reply,"context" : context_text, "chat_id": chat_id}

    except Exception as e:
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
