from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat  # import your chat router module
from dotenv import load_dotenv
from routes import auth
from routes import summary

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat.router)  # All endpoints will start with /api
app.include_router(auth.router)
app.include_router(summary.router)
