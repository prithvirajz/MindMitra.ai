/**
 * Journal Page – Reflection journaling
 *
 * A simple, calming space for users to write journal entries.
 * Entries are saved to Supabase via the journal_entries table.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { BookOpen, Save, Clock, Trash2, Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface JournalEntry {
    id: string;
    content: string;
    mood: string | null;
    created_at: string;
}

const journalPrompts = [
    "What made you smile today?",
    "What's one thing you're grateful for right now?",
    "How are you really feeling? No filter needed.",
    "What would you tell your best friend if they felt this way?",
    "What's one small thing you can do for yourself today?",
    "Describe your ideal peaceful moment.",
    "What emotion feels strongest right now? Why?",
];

export default function JournalPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        const init = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUserId(session.user.id);

            // Fetch existing entries
            const { data } = await supabase
                .from("journal_entries")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (data) setEntries(data);

            // Random writing prompt
            setPrompt(
                journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
            );
        };
        init();
    }, [router]);

    const handleSave = async () => {
        if (!content.trim() || !userId) return;
        setSaving(true);

        try {
            const { data, error } = await supabase
                .from("journal_entries")
                .insert({
                    user_id: userId,
                    content: content.trim(),
                    mood: null,
                })
                .select()
                .single();

            if (error) throw error;

            setEntries((prev) => [data, ...prev]);
            setContent("");
            toast.success("Journal entry saved! 📝");

            // New prompt
            setPrompt(
                journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
            );
        } catch (error) {
            console.error("Failed to save:", error);
            toast.error("Failed to save entry");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await supabase.from("journal_entries").delete().eq("id", id);
            setEntries((prev) => prev.filter((e) => e.id !== id));
            toast.success("Entry deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 pt-20 pb-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Reflection Journal
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        A safe space to explore your thoughts and feelings
                    </p>
                </div>

                {/* Writing Area */}
                <div className="glass-card p-6 mb-8">
                    {/* Writing Prompt */}
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <p className="text-sm text-purple-300 italic">{prompt}</p>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write freely... this is your space. No one else can see your journal."
                        rows={8}
                        className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/10">
                        <span className="text-xs text-slate-500">
                            {content.length} characters
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={!content.trim() || saving}
                            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Entry
                        </button>
                    </div>
                </div>

                {/* Past Entries */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        Past Entries
                    </h2>

                    {entries.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <Plus className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                            <p className="text-sm text-slate-400">
                                No journal entries yet. Start writing above! ✍️
                            </p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="glass-card p-5 group hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
                                        {entry.content}
                                    </p>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">
                                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
