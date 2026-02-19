/**
 * MoodCheckIn.tsx – Daily mood check-in popup
 *
 * Shows once per day to ask how the user is feeling.
 * Saves the mood directly to the backend.
 */

"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

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
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!selected) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            // Send a simple check-in message to trigger mood logging
            await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    message: `Daily check-in: I'm feeling ${selected} today.`,
                }),
            });
            setSubmitted(true);

            // Save the last check-in date to localStorage
            localStorage.setItem("lastMoodCheckIn", new Date().toDateString());

            // Auto-close after 2 seconds
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Mood check-in failed:", error);
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

                {submitted ? (
                    /* Success State */
                    <div className="text-center py-4">
                        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">
                            Thanks for checking in! 💙
                        </h3>
                        <p className="text-sm text-slate-400">
                            Your mood has been recorded.
                        </p>
                    </div>
                ) : (
                    /* Check-in Form */
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}
