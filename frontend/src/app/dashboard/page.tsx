/**
 * Dashboard Page – Mood analytics with charts
 *
 * Displays:
 * - Emotion distribution pie chart
 * - Weekly mood trend line chart
 * - Summary statistics
 * - AI-generated weekly mood summary
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMoodHistory, MoodData } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Smile,
    AlertCircle,
} from "lucide-react";

// Emotion → Color mapping
const EMOTION_COLORS: Record<string, string> = {
    joy: "#10b981",
    sadness: "#3b82f6",
    anger: "#ef4444",
    fear: "#f59e0b",
    surprise: "#ec4899",
    disgust: "#f97316",
    neutral: "#64748b",
};

// Emotion → Emoji mapping
const EMOTION_EMOJI: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😰",
    surprise: "😲",
    disgust: "🤢",
    neutral: "😐",
};

export default function DashboardPage() {
    const router = useRouter();
    const [moodData, setMoodData] = useState<MoodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            try {
                const data = await getMoodHistory(session.user.id, days);
                setMoodData(data);
            } catch (error) {
                console.error("Failed to fetch mood data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router, days]);

    // ── Prepare pie chart data ──
    const pieData =
        moodData?.distribution
            ? Object.entries(moodData.distribution).map(([name, value]) => ({
                name,
                value,
                emoji: EMOTION_EMOJI[name] || "💭",
            }))
            : [];

    // ── Prepare line chart data (aggregate by date) ──
    const lineData = moodData?.timeline
        ? (() => {
            const grouped: Record<string, Record<string, number>> = {};
            moodData.timeline.forEach((entry) => {
                const date = new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
                if (!grouped[date]) grouped[date] = {};
                grouped[date][entry.emotion] =
                    (grouped[date][entry.emotion] || 0) + 1;
            });
            return Object.entries(grouped).map(([date, emotions]) => ({
                date,
                ...emotions,
            }));
        })()
        : [];

    // ── Find dominant emotion ──
    const dominantEmotion = pieData.length
        ? pieData.reduce((a, b) => (a.value > b.value ? a : b))
        : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-20 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                            <BarChart3 className="w-6 h-6" />
                            Mood Dashboard
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Track your emotional journey over time
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                        {[7, 14, 30].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${days === d
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-purple-500/10"
                                    }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                {!moodData || moodData.total_entries === 0 ? (
                    /* Empty State */
                    <div className="glass-card p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">
                            No mood data yet
                        </h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Start chatting with MindMitra to track your emotions
                            automatically!
                        </p>
                        <button
                            onClick={() => router.push("/chat")}
                            className="btn-primary"
                        >
                            Start Chatting
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="glass-card p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {moodData.total_entries}
                                        </p>
                                        <p className="text-xs text-slate-400">Mood Entries</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Smile className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {dominantEmotion?.emoji} {dominantEmotion?.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Dominant Emotion
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            {Object.keys(moodData.distribution).length}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Unique Emotions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-bold text-white mb-4">
                                    Emotion Distribution
                                </h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({ name, percent }: { name?: string; percent?: number }) =>
                                                `${EMOTION_EMOJI[name || ""] || ""} ${((percent || 0) * 100).toFixed(0)}%`
                                            }
                                        >
                                            {pieData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={EMOTION_COLORS[entry.name] || "#64748b"}
                                                    stroke="transparent"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: "#16213e",
                                                border: "1px solid rgba(124,58,237,0.3)",
                                                borderRadius: "12px",
                                                color: "#f1f5f9",
                                            }}
                                        />
                                        <Legend
                                            formatter={(value: string) =>
                                                `${EMOTION_EMOJI[value] || ""} ${value}`
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Line Chart */}
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-bold text-white mb-4">
                                    Mood Trends
                                </h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={lineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                        <YAxis stroke="#64748b" fontSize={11} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "#16213e",
                                                border: "1px solid rgba(124,58,237,0.3)",
                                                borderRadius: "12px",
                                                color: "#f1f5f9",
                                            }}
                                        />
                                        {Object.keys(EMOTION_COLORS).map((emotion) => (
                                            <Line
                                                key={emotion}
                                                type="monotone"
                                                dataKey={emotion}
                                                stroke={EMOTION_COLORS[emotion]}
                                                strokeWidth={2}
                                                dot={false}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
