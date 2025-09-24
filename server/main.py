from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat  # import your chat router module
from dotenv import load_dotenv
from routes import auth
from routes import summary
from routes import docs
from routes import user
from routes import drafts
from routes.oauth_google import router as oauth_router

load_dotenv(".env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(summary.router)
app.include_router(docs.router)
app.include_router(user.router)
app.include_router(drafts.router)
app.include_router(oauth_router)