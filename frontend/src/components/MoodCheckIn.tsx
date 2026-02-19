/**
 * MoodCheckIn.tsx – Daily mood check-in popup
 *
 * Shows once per day to ask how the user is feeling.
 * Saves the mood directly to the backend.
 */

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface MoodCheckInProps {
    userId: string;
    onClose: () => void;
}

const moods = [
    { emoji: "😊", label: "Happy", value: "joy" },
    { emoji: "😐", label: "Okay", value: "neutral" },
    { emoji: "😢", label: "Sad", value: "sadness" },
    { emoji: "😰", label: "Anxious", value: "fear" },
    { emoji: "😠", label: "Angry", value: "anger" },
    { emoji: "😲", label: "Surprised", value: "surprise" },
];

export default function MoodCheckIn({ userId, onClose }: MoodCheckInProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selected) return;

        // 1. Close immediately for snappy UX
        onClose();

        // 2. Prevent showing again today (optimistic update)
        localStorage.setItem("lastMoodCheckIn", new Date().toDateString());

        // 3. Send request in background
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    message: `Daily check-in: I'm feeling ${selected} today.`,
                }),
            });

            if (res.ok) {
                toast.success("Mood logged successfully! 💙", {
                    icon: "📝",
                    style: {
                        background: "#1e1e2e",
                        color: "#fff",
                        border: "1px solid #3b82f6",
                    },
                });
            } else {
                throw new Error("Failed to log mood");
            }
        } catch (error) {
            console.error("Mood check-in failed:", error);
            // Non-blocking error toast
            toast.error("Could not save mood, but checked in locally.", {
                style: {
                    background: "#1e1e2e",
                    color: "#fff",
                    border: "1px solid #ef4444",
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm glass-card p-6 animate-fade-in-up">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Check-in Form */}
                <div className="text-center mb-5">
                    <h3 className="text-lg font-bold text-white mb-1">
                        How are you feeling today?
                    </h3>
                    <p className="text-sm text-slate-400">
                        A quick daily check-in to track your mood
                    </p>
                </div>

                {/* Mood Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {moods.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setSelected(mood.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${selected === mood.value
                                ? "border-purple-500 bg-purple-500/20 scale-105"
                                : "border-purple-500/10 bg-purple-500/5 hover:bg-purple-500/10"
                                }`}
                        >
                            <span className="text-2xl">{mood.emoji}</span>
                            <span className="text-xs text-slate-300">{mood.label}</span>
                        </button>
                    ))}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="btn-primary w-full"
                >
                    Log My Mood
                </button>
            </div>
        </div>
    );
}
