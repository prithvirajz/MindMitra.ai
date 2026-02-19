"""
routes/mood.py – Mood analytics endpoint for MindMitra.

GET /mood/{user_id}
  - Fetches mood history from Supabase
  - Computes emotion distribution (for pie chart)
  - Returns timeline data (for line chart)
"""

from fastapi import APIRouter, HTTPException
from collections import Counter
from db import get_mood_history

router = APIRouter()


@router.get("/mood/{user_id}")
async def get_mood(user_id: str, days: int = 30):
    """
    Get mood analytics for a user.
    
    Returns:
        - distribution: emotion counts for pie chart
        - timeline: mood entries over time for line chart
        - total_entries: total number of mood logs
    """
    try:
        mood_data = get_mood_history(user_id, days=days)
        
        if not mood_data:
            return {
                "distribution": {},
                "timeline": [],
                "total_entries": 0,
                "message": "No mood data yet. Start chatting to track your emotions!"
            }
        
        # ── Compute emotion distribution (for pie chart) ──
        emotion_counts = Counter(entry["emotion"] for entry in mood_data)
        distribution = dict(emotion_counts.most_common())
        
        # ── Build timeline data (for line chart) ──
        timeline = [
            {
                "date": entry["created_at"],
                "emotion": entry["emotion"],
                "confidence": entry["confidence"]
            }
            for entry in mood_data
        ]
        
        return {
            "distribution": distribution,
            "timeline": timeline,
            "total_entries": len(mood_data)
        }
        
    except Exception as e:
        print(f"❌ Error in /mood endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch mood data."
        )
