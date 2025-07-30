import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "../chroma_data") 

DOC_DIR = "legal_docs"
EMBED_MODEL = "BAAI/bge-base-en-v1.5"

#Setup
# chroma_client = chromadb.Client()
chroma_client = chromadb.PersistentClient(path=PERSIST_DIR)
collection = chroma_client.get_or_create_collection(name="legal_docs")
embedder = SentenceTransformer(EMBED_MODEL)
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

# Ingest loop
doc_id = 0
for fname in os.listdir(DOC_DIR):
    if not fname.endswith(".txt"):
        continue
    file_path = os.path.join(DOC_DIR, fname)

    # Safe decoding
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='latin-1') as f:
            raw_text = f.read()

    chunks = splitter.split_text(raw_text)
    embeddings = embedder.encode(chunks)

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"source": fname}] * len(chunks),
        ids=[f"{fname}_{i}" for i in range(len(chunks))]
    )
    print(f"Ingested: {fname}")
    
