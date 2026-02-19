/**
 * Chat Page – Core chat interface for MindMitra
 *
 * Features:
 * - Message bubbles with user/AI styling
 * - Typing animation while AI responds
 * - Emotion tags on each message
 * - Crisis detection modal
 * - Coping suggestions sidebar
 * - Daily mood check-in popup
 * - Auto-scroll to latest message
 * - Mobile responsive
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { sendMessage, ChatResponse } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";
import CrisisModal from "@/components/CrisisModal";
import CopingSuggestions from "@/components/CopingSuggestions";
import MoodCheckIn from "@/components/MoodCheckIn";
import { Send, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
    id: string;
    role: "user" | "assistant";
    message: string;
    emotion?: string;
    timestamp?: string;
}

export default function ChatPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [latestEmotion, setLatestEmotion] = useState<string | null>(null);
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Auth Check ──
    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUserId(session.user.id);

            // Check if mood check-in should show (once per day)
            const lastCheckIn = localStorage.getItem("lastMoodCheckIn");
            const today = new Date().toDateString();
            if (lastCheckIn !== today) {
                setTimeout(() => setShowMoodCheckIn(true), 2000);
            }
        };
        checkAuth();
    }, [router]);

    // ── Auto-scroll to bottom ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // ── Welcome message ──
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    message:
                        "Hello! I'm MindMitra, your supportive AI companion. 💙\n\nI'm here to listen, understand, and walk alongside you. Whatever you're feeling right now — it's valid.\n\nHow are you doing today? Feel free to share anything on your mind.",
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Send Message ──
    const handleSend = async () => {
        if (!input.trim() || isLoading || !userId) return;

        const userMessage = input.trim();
        setInput("");

        // Optimistic UI: add user message immediately
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            message: userMessage,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Call backend
            const response: ChatResponse = await sendMessage(userId, userMessage);

            // Update user message with detected emotion
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === userMsg.id ? { ...msg, emotion: response.emotion } : msg
                )
            );

            // Add AI response
            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                role: "assistant",
                message: response.reply,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, aiMsg]);

            // Update latest emotion for coping suggestions
            setLatestEmotion(response.emotion);

            // Handle crisis
            if (response.crisis) {
                setShowCrisisModal(true);
            }
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to send message. Please try again.");

            // Add error message
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    message:
                        "I'm sorry, I'm having trouble responding right now. Please try again in a moment. 💙",
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // ── Handle Enter key ──
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex pt-16">
                {/* ── Main Chat Area ── */}
                <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-6 space-y-4">
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                role={msg.role}
                                message={msg.message}
                                emotion={msg.emotion}
                                timestamp={msg.timestamp}
                            />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a] to-transparent">
                        <div className="glass-card p-3 flex items-end gap-3">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Share what's on your mind..."
                                rows={1}
                                maxLength={2000}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm resize-none max-h-32"
                                style={{
                                    height: "auto",
                                    minHeight: "24px",
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Character count */}
                        {input.length > 1500 && (
                            <p className="text-xs text-slate-500 text-right mt-1">
                                {input.length}/2000
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Coping Suggestions Sidebar (desktop only) ── */}
                {latestEmotion && (
                    <div className="hidden lg:block w-72 p-4 pt-6">
                        <div className="sticky top-20">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-white">
                                    Coping Suggestion
                                </h3>
                            </div>
                            <CopingSuggestions emotion={latestEmotion} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <CrisisModal
                isOpen={showCrisisModal}
                onClose={() => setShowCrisisModal(false)}
            />

            {showMoodCheckIn && userId && (
                <MoodCheckIn
                    userId={userId}
                    onClose={() => setShowMoodCheckIn(false)}
                />
            )}
        </div>
    );
}
