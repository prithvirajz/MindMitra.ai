/**
 * TypingIndicator.tsx – Animated typing dots
 * Shows while the AI is generating a response.
 */

export default function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in-up">
            {/* AI Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                <span className="text-xs font-bold text-white">M</span>
            </div>

            {/* Typing Dots Bubble */}
            <div className="chat-bubble-ai flex items-center gap-1.5 px-5 py-4">
                <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
            </div>
        </div>
    );
}
