/**
 * lib/api.ts – Backend API helper functions
 *
 * All calls to the FastAPI backend go through here.
 * Centralizes error handling and request formatting.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ──────────────────────────────────────────────────────

export interface ChatResponse {
    reply: string;
    emotion: string;
    confidence: number;
    crisis: boolean;
}

export interface MoodData {
    distribution: Record<string, number>;
    timeline: Array<{
        date: string;
        emotion: string;
        confidence: number;
    }>;
    total_entries: number;
    message?: string;
}

// ─── Chat API ───────────────────────────────────────────────────

export async function sendMessage(
    userId: string,
    message: string
): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message }),
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
    }

    return response.json();
}

// ─── Mood API ───────────────────────────────────────────────────

export async function getMoodHistory(
    userId: string,
    days: number = 30
): Promise<MoodData> {
    const response = await fetch(
        `${API_URL}/mood/${userId}?days=${days}`
    );

    if (!response.ok) {
        throw new Error(`Mood API error: ${response.status}`);
    }

    return response.json();
}
