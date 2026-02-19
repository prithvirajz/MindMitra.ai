/**
 * CrisisModal.tsx – Emergency crisis support modal
 *
 * Displayed when crisis/self-harm is detected in user messages.
 * Shows helpline numbers and a calming message.
 */

"use client";

import { X, Phone, Heart } from "lucide-react";

interface CrisisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const helplines = [
    {
        country: "🇮🇳 India",
        lines: [
            { name: "iCall", number: "9152987821" },
            { name: "Vandrevala Foundation", number: "1860-2662-345" },
            { name: "AASRA", number: "9820466726" },
        ],
    },
    {
        country: "🇺🇸 USA",
        lines: [
            { name: "988 Suicide & Crisis Lifeline", number: "988" },
            { name: "Crisis Text Line", number: "Text HOME to 741741" },
        ],
    },
    {
        country: "🌍 International",
        lines: [
            { name: "Befrienders Worldwide", number: "befrienders.org" },
        ],
    },
];

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg glass-card p-6 border-red-500/30 animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            You&apos;re Not Alone 💙
                        </h2>
                        <p className="text-sm text-slate-400">
                            Help is available right now
                        </p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    I hear you, and I care about your safety. What you&apos;re feeling is
                    valid, and there are people who can help. Please consider reaching out
                    to a crisis helpline:
                </p>

                {/* Helplines */}
                <div className="space-y-4 mb-5">
                    {helplines.map((group) => (
                        <div key={group.country}>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {group.country}
                            </h3>
                            <div className="space-y-2">
                                {group.lines.map((line) => (
                                    <div
                                        key={line.name}
                                        className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {line.name}
                                            </p>
                                            <p className="text-xs text-red-300">{line.number}</p>
                                        </div>
                                        <Phone className="w-4 h-4 text-red-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reminder */}
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-purple-300 leading-relaxed">
                        💡 <strong>Remember:</strong> MindMitra is a supportive companion,
                        not a replacement for professional help. A trained counselor can
                        provide the care you deserve.
                    </p>
                </div>
            </div>
        </div>
    );
}
