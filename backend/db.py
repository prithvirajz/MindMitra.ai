"""
db.py – Supabase REST API client for database operations.

Uses direct HTTP calls to the Supabase PostgREST API instead of the
Python SDK, avoiding dependency conflicts with gotrue/httpx/httpcore.

Handles all database operations:
  - Saving chat messages (user + AI)
  - Saving mood logs (emotion + confidence)
  - Fetching mood history for analytics
  - Fetching recent chats for conversation memory
"""


import httpx
from datetime import datetime, timedelta
from config import settings


# ─── Supabase REST helpers ───────────────────────────────────────
# Using the service key to bypass RLS (backend acts on behalf of users)

HEADERS = {
    "apikey": settings.SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

BASE_URL = f"{settings.SUPABASE_URL}/rest/v1"


def _request(method: str, table: str, **kwargs) -> list:
    """Make a request to the Supabase REST API."""
    url = f"{BASE_URL}/{table}"
    resp = httpx.request(method, url, headers=HEADERS, **kwargs)
    resp.raise_for_status()
    return resp.json() if resp.text else []


# ─── Chat Operations ────────────────────────────────────────────

def save_chat_message(
    user_id: str,
    role: str,          # "user" or "assistant"
    message: str,
    emotion: str = None
) -> dict:
    """
    Save a single chat message to the 'chats' table.
    
    Args:
        user_id: The authenticated user's ID
        role: Either "user" or "assistant"
        message: The message text
        emotion: Detected emotion label (optional)
    
    Returns:
        The inserted row as a dict
    """
    data = {
        "user_id": user_id,
        "role": role,
        "message": message,
        "emotion": emotion,
        "created_at": datetime.utcnow().isoformat()
    }
    result = _request("POST", "chats", json=data)
    return result[0] if result else {}


def get_recent_chats(user_id: str, limit: int = 10) -> list:
    """
    Fetch the most recent chat messages for a user.
    Used to build conversation context for the LLM.
    
    Args:
        user_id: The authenticated user's ID
        limit: Max number of messages to return (default 10 = 5 pairs)
    
    Returns:
        List of chat dicts, ordered oldest → newest
    """
    params = {
        "select": "role,message",
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": str(limit),
    }
    result = _request("GET", "chats", params=params)
    # Reverse so oldest messages come first (for LLM context)
    return list(reversed(result)) if result else []


# ─── Mood Operations ────────────────────────────────────────────

def save_mood_log(
    user_id: str,
    emotion: str,
    confidence: float
) -> dict:
    """
    Save an emotion detection result to the 'mood_logs' table.
    Called every time the user sends a message.
    
    Args:
        user_id: The authenticated user's ID
        emotion: Detected emotion label (e.g., "sadness")
        confidence: Model confidence score (0.0 – 1.0)
    
    Returns:
        The inserted row as a dict
    """
    data = {
        "user_id": user_id,
        "emotion": emotion,
        "confidence": confidence,
        "created_at": datetime.utcnow().isoformat()
    }
    result = _request("POST", "mood_logs", json=data)
    return result[0] if result else {}


def get_mood_history(user_id: str, days: int = 30) -> list:
    """
    Fetch mood logs for a user within the last N days.
    Used for the mood analytics dashboard.
    
    Args:
        user_id: The authenticated user's ID
        days: Number of days to look back (default 30)
    
    Returns:
        List of mood_log dicts with emotion, confidence, and timestamp
    """
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    params = {
        "select": "emotion,confidence,created_at",
        "user_id": f"eq.{user_id}",
        "created_at": f"gte.{cutoff}",
        "order": "created_at.asc",
    }
    result = _request("GET", "mood_logs", params=params)
    return result if result else []
