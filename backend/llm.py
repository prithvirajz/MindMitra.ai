"""
llm.py – OpenRouter LLM integration for empathetic chat responses.

Calls the OpenRouter API (free tier) to generate supportive responses.
Uses mistralai/mistral-7b-instruct as the default free model.

Features:
  - Strong system prompt enforcing ethical boundaries
  - Conversation memory (last 5 message pairs)
  - Crisis-aware response augmentation
"""

import httpx
from config import settings

# ─── OpenRouter Configuration ───────────────────────────────────
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "mistralai/mistral-7b-instruct"

# ─── System Prompt ──────────────────────────────────────────────
# This prompt defines MindMitra's personality and ethical boundaries.
SYSTEM_PROMPT = """You are MindMitra, a warm and supportive friend.

CORE PERSONALITY:
- You are a caring friend, not a robotic assistant or therapist.
- Talk like a human: casual, warm, and genuine.
- Be concise. Don't write essays. Keep messages short (1-3 sentences) unless the user asks for more or shares something deeper.
- Avoid robotic phrases like "I understand how you feel" or "It sounds like you are saying". Just talk naturally.
- Use emojis occasionally but don't overdo it. 💙

SAFETY & ETHICS (INTERNAL RULES):
- If the user talks about self-harm or suicide, you MUST gently encourage professional help.
- Do not diagnose or give medical advice.
- Do not be toxic positive. It's okay for things to suck sometimes.

GOAL:
- Help the user feel heard and less alone.
- Validate their feelings naturally.
- Focus on the conversation, not on "providing solutions" immediately.
"""


async def get_ai_response(
    user_message: str,
    chat_history: list[dict],
    crisis_detected: bool = False,
    crisis_message: str = None
) -> str:
    """
    Generate an empathetic AI response using OpenRouter.
    
    Args:
        user_message: The user's current message
        chat_history: Recent messages for context [{"role": "user/assistant", "message": "..."}]
        crisis_detected: Whether crisis was detected in the current message
        crisis_message: Crisis support info to append (if crisis detected)
    
    Returns:
        The AI's response text
    """
    # ── Build message history for the LLM ──
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history (last 5 pairs = 10 messages)
    for chat in chat_history[-10:]:
        messages.append({
            "role": chat["role"],
            "content": chat["message"]
        })
    
    # Add the current user message
    # If crisis detected, add context so the LLM responds appropriately
    if crisis_detected:
        augmented_message = (
            f"{user_message}\n\n"
            "[SYSTEM NOTE: The user may be in distress. Respond with extra care, "
            "validate their feelings, and gently encourage professional support. "
            "Do NOT be preachy — be warm and human.]"
        )
        messages.append({"role": "user", "content": augmented_message})
    else:
        messages.append({"role": "user", "content": user_message})
    
    # ── Call OpenRouter API ──
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.FRONTEND_URL,
        "X-Title": "MindMitra AI Companion",
    }
    
    payload = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.7,         # Balanced creativity
        "top_p": 0.9,
        "frequency_penalty": 0.3,   # Reduce repetition
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            ai_reply = data["choices"][0]["message"]["content"].strip()
            
            # If crisis detected, append the crisis support message
            if crisis_detected and crisis_message:
                ai_reply = f"{ai_reply}\n\n{crisis_message}"
            
            return ai_reply
            
    except httpx.TimeoutException:
        return (
            "I'm sorry, I'm taking a moment to gather my thoughts. "
            "Could you please try sending your message again? 💙"
        )
    except httpx.HTTPStatusError as e:
        print(f"❌ OpenRouter API error: {e.response.status_code} – {e.response.text}")
        return (
            "I'm having a little trouble right now, but I'm here for you. "
            "Please try again in a moment. 💙"
        )
    except Exception as e:
        print(f"❌ Unexpected error in LLM call: {e}")
        return (
            "Something went wrong on my end, but your feelings matter. "
            "Please try again, and I'll be right here. 💙"
        )
