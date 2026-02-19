"""
emotion.py – Emotion detection using LLM (Lightweight).

Replaces the heavy HuggingFace Transformers model with an API call 
to OpenRouter (via llm.classify_emotion). This saves ~500MB RAM.
"""

from llm import classify_emotion

async def detect_emotion(text: str) -> tuple[str, float]:
    """
    Detect emotion using LLM (Async).
    
    Args:
        text: The user's message text
    
    Returns:
        Tuple of (emotion_label, confidence_score)
        Example: ("sadness", 0.9)
    """
    return await classify_emotion(text)
