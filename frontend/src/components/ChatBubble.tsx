/**
 * ChatBubble.tsx – Individual message bubble
 *
 * Renders user or AI messages with proper styling,
 * emotion badge, and fade-in animation.
 */

interface ChatBubbleProps {
    role: "user" | "assistant";
    message: string;
    emotion?: string;
    timestamp?: string;
}

// Map emotions to colors for the badge
const emotionColors: Record<string, string> = {
    joy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    sadness: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    anger: "bg-red-500/20 text-red-300 border-red-500/30",
    fear: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    surprise: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    disgust: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    neutral: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

// Map emotions to emoji
const emotionEmoji: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😰",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
};

export default function ChatBubble({
    role,
    message,
    emotion,
    timestamp,
}: ChatBubbleProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex items-start gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""
                }`}
        >
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${isUser
                        ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/25"
                        : "bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
                    }`}
            >
                <span className="text-xs font-bold text-white">
                    {isUser ? "U" : "M"}
                </span>
            </div>

            {/* Message Content */}
            <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div className={isUser ? "chat-bubble-user" : "chat-bubble-ai"}>
                    {/* Render message with line breaks */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>

                {/* Emotion Badge + Timestamp */}
                <div className={`flex items-center gap-2 mt-1.5 ${isUser ? "flex-row-reverse" : ""}`}>
                    {emotion && (
                        <span
                            className={`emotion-badge border ${emotionColors[emotion] || emotionColors.neutral
                                }`}
                        >
                            <span>{emotionEmoji[emotion] || "💭"}</span>
                            <span>{emotion}</span>
                        </span>
                    )}
                    {timestamp && (
                        <span className="text-[10px] text-slate-500">{timestamp}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
