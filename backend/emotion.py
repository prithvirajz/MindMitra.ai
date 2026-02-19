"""
emotion.py – Emotion detection using HuggingFace Transformers.

Uses the 'j-hartmann/emotion-english-distilroberta-base' model which
classifies text into 7 emotions:
  anger, disgust, fear, joy, neutral, sadness, surprise

The model is loaded once at module import time and cached in memory.
"""

from transformers import pipeline

# ─── Load the emotion classification pipeline ───────────────────
# This downloads the model on first run (~320 MB) and caches it locally.
# Subsequent runs load from cache instantly.
print("🔄 Loading emotion detection model...")
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,          # Return all emotion scores
    truncation=True,     # Handle long texts gracefully
)
print("✅ Emotion detection model loaded successfully!")


def detect_emotion(text: str) -> tuple[str, float]:
    """
    Detect the dominant emotion in a text message.
    
    Args:
        text: The user's message text
    
    Returns:
        Tuple of (emotion_label, confidence_score)
        Example: ("sadness", 0.87)
    """
    # Get predictions (list of dicts with 'label' and 'score')
    results = emotion_classifier(text)
    
    # results is a list containing one list of all emotion scores
    # e.g., [[{'label': 'sadness', 'score': 0.87}, {'label': 'joy', 'score': 0.05}, ...]]
    emotions = results[0]
    
    # Find the emotion with the highest confidence
    top_emotion = max(emotions, key=lambda x: x["score"])
    
    return top_emotion["label"], round(top_emotion["score"], 4)


def get_all_emotions(text: str) -> list[dict]:
    """
    Get all emotion scores for a text message.
    Useful for detailed analysis or threshold-based crisis detection.
    
    Args:
        text: The user's message text
    
    Returns:
        List of dicts with 'label' and 'score', sorted by score descending
        Example: [{'label': 'sadness', 'score': 0.87}, ...]
    """
    results = emotion_classifier(text)
    emotions = results[0]
    return sorted(emotions, key=lambda x: x["score"], reverse=True)
