"""
routes/chat.py – Chat endpoint for MindMitra.

POST /chat
  - Receives user message
  - Detects emotion
  - Checks for crisis
  - Generates empathetic AI response
  - Saves everything to Supabase
  - Returns structured response
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from emotion import detect_emotion
from crisis import detect_crisis
from llm import get_ai_response
from db import save_chat_message, save_mood_log, get_recent_chats

router = APIRouter()


# ─── Request / Response Models ──────────────────────────────────

class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128, description="User identifier")
    message: str = Field(..., min_length=1, max_length=2000, description="User message (max 2000 chars)")


class ChatResponse(BaseModel):
    reply: str
    emotion: str
    confidence: float
    crisis: bool


# ─── POST /chat ─────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint. Processes user message through the full pipeline:
    1. Emotion detection
    2. Crisis detection
    3. LLM response generation
    4. Database persistence
    """
    user_id = request.user_id
    message = request.message.strip()
    
    # Validate input isn't just whitespace
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # ── Step 1: Detect emotion ──
        emotion_label, confidence = detect_emotion(message)
        
        # ── Step 2: Check for crisis ──
        is_crisis, crisis_message = detect_crisis(
            text=message,
            emotion_label=emotion_label,
            emotion_confidence=confidence
        )
        
        # ── Step 3: Get conversation history for context ──
        chat_history = get_recent_chats(user_id, limit=10)
        
        # ── Step 4: Generate AI response ──
        ai_reply = await get_ai_response(
            user_message=message,
            chat_history=chat_history,
            crisis_detected=is_crisis,
            crisis_message=crisis_message
        )
        
        # ── Step 5: Save to database ──
        # Save user message
        save_chat_message(
            user_id=user_id,
            role="user",
            message=message,
            emotion=emotion_label
        )
        
        # Save AI response
        save_chat_message(
            user_id=user_id,
            role="assistant",
            message=ai_reply,
            emotion=None
        )
        
        # Save mood log
        save_mood_log(
            user_id=user_id,
            emotion=emotion_label,
            confidence=confidence
        )
        
        # ── Step 6: Return response ──
        return ChatResponse(
            reply=ai_reply,
            emotion=emotion_label,
            confidence=confidence,
            crisis=is_crisis
        )
        
    except Exception as e:
        print(f"❌ Error in /chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )
