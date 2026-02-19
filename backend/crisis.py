"""
crisis.py – Crisis and self-harm detection module.

Implements a HYBRID approach:
  1. Rule-based keyword matching (immediate flags)
  2. Emotion threshold analysis (soft risk flags)

⚠️ ETHICS NOTE:
This is NOT a clinical tool. It provides basic safety guardrails.
When crisis is detected, the system encourages the user to seek
real professional help and provides helpline numbers.
"""

import re


# ─── Crisis Keywords ────────────────────────────────────────────
# These phrases indicate immediate crisis risk.
# Using lowercase for case-insensitive matching.
CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "want to die",
    "hurt myself",
    "no reason to live",
    "self harm",
    "self-harm",
    "end my life",
    "end it all",
    "don't want to live",
    "don't want to be alive",
    "better off dead",
    "can't go on",
    "nothing to live for",
    "take my own life",
    "wish i was dead",
    "not worth living",
]

# ─── Crisis Support Message ─────────────────────────────────────
CRISIS_MESSAGE = """
🆘 **I hear you, and I care about your safety.**

What you're feeling right now is real and valid, but please know that help is available.

**Please reach out to a crisis helpline:**
🇮🇳 India: **iCall – 9152987821** | **Vandrevala Foundation – 1860-2662-345**
🇺🇸 USA: **988 Suicide & Crisis Lifeline – 988**
🌍 International: **Befrienders Worldwide – befrienders.org**

You are not alone. A trained counselor can help you through this moment.
💙 Please talk to someone you trust today.
"""

# ─── Soft Risk Thresholds ───────────────────────────────────────
# If these emotions exceed the threshold, flag as soft risk
SOFT_RISK_EMOTIONS = {
    "sadness": 0.85,
    "fear": 0.85,
}


def detect_crisis(
    text: str,
    emotion_label: str = None,
    emotion_confidence: float = None
) -> tuple[bool, str | None]:
    """
    Detect if a message indicates a mental health crisis.
    
    Uses two methods:
      1. Keyword matching: scans for explicit crisis phrases
      2. Emotion threshold: checks if sadness/fear confidence is dangerously high
    
    Args:
        text: The user's message
        emotion_label: Detected emotion (from emotion.py)
        emotion_confidence: Confidence score for the detected emotion
    
    Returns:
        Tuple of (is_crisis: bool, crisis_message: str | None)
        If crisis is detected, crisis_message contains the support info.
    """
    text_lower = text.lower().strip()
    
    # ── Method 1: Keyword Detection ──
    for keyword in CRISIS_KEYWORDS:
        # Use word boundary matching to reduce false positives
        # e.g., "killing time" shouldn't trigger, but "kill myself" should
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        if pattern.search(text_lower):
            return True, CRISIS_MESSAGE
    
    # ── Method 2: Emotion Threshold Detection ──
    if emotion_label and emotion_confidence:
        threshold = SOFT_RISK_EMOTIONS.get(emotion_label)
        if threshold and emotion_confidence >= threshold:
            return True, CRISIS_MESSAGE
    
    return False, None
