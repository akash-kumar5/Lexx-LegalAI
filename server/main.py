# main.py (or whatever your current entrypoint is)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat  # import your chat router module
from dotenv import load_dotenv
from routes import auth
from routes import summary
from routes import docs
from routes import user
from routes import drafts
from routes import cases
from routes.oauth_google import router as oauth_router
import os

load_dotenv(".env.local")

app = FastAPI()

raw = os.getenv("FRONTEND_ORIGINS", "")
if raw:
    origins = [o.strip() for o in raw.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.29.57:3000", 
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # MUST be explicit when allow_credentials=True
    allow_credentials=True,     # required if you're using cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(summary.router)
app.include_router(docs.router)
app.include_router(user.router)
app.include_router(drafts.router)
app.include_router(oauth_router)
app.include_router(cases.router)
