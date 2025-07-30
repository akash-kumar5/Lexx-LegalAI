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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "../chroma_data") 
load_dotenv()

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

@router.post("/chat")
async def ask_llm(request: ChatRequest, user: User = Depends(get_current_user)):
    try:
        chat_id = request.chat_id

        if not chat_id:
            chat = {"user_id": user.id, "messages": []}
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
        response = llm_client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "user", "content": f"""You are an Indian legal assistant and advisor.
                 Use your intelligence and the context below to answer factually.

Context:{context_text}

User: {request.prompt}
Assistant:"""}
            ],
        )

        assistant_reply = response.choices[0].message.content.strip()

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
        "preview": chat["messages"][0]["content"][:50] if chat.get("messages") else ""
    } for chat in chats]


@router.get("/chats/{chat_id}")
async def get_chat_messages(chat_id: str, user: User = Depends(get_current_user)):
    chat = await chats_collection.find_one({"_id": ObjectId(chat_id), "user_id": user.id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.get("messages", [])


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
