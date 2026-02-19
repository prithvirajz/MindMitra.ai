"""
main.py – FastAPI application for MindMitra AI Mental Health Companion.

This is the entry point for the backend server.
It configures CORS, rate limiting, and registers all routes.

Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from config import settings
from routes.chat import router as chat_router
from routes.mood import router as mood_router


# ─── Rate Limiter Setup ─────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ─── Lifespan (startup/shutdown events) ─────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown.
    The emotion model is loaded at import time (in emotion.py),
    so it's ready by the time the app starts serving requests.
    """
    print("🧠 MindMitra backend is starting up...")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"🔗 Frontend URL: {settings.FRONTEND_URL}")
    yield
    print("👋 MindMitra backend is shutting down...")


# ─── Create FastAPI App ─────────────────────────────────────────
app = FastAPI(
    title="MindMitra API",
    description="AI Mental Health Companion – Supportive, not clinical.",
    version="1.0.0",
    lifespan=lifespan,
)

# Register rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ─── CORS Configuration ─────────────────────────────────────────
# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Simple health check endpoint for monitoring and deployment."""
    return {
        "status": "ok",
        "service": "MindMitra API",
        "version": "1.0.0"
    }


# ─── Register Routes ────────────────────────────────────────────
app.include_router(chat_router, tags=["Chat"])
app.include_router(mood_router, tags=["Mood Analytics"])


# ─── Root Endpoint ──────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Welcome to MindMitra API 🧠💙",
        "docs": "/docs",
        "health": "/health"
    }
