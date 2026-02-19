/**
 * CopingSuggestions.tsx – Emotion-based coping strategy cards
 *
 * Maps detected emotions to specific coping activities.
 * Displays as beautiful gradient cards with icons and instructions.
 */

"use client";

import {
    BookOpen,
    Wind,
    TreePine,
    Pause,
    Shield,
    Smile,
    Sparkles,
} from "lucide-react";

interface CopingSuggestionsProps {
    emotion: string | null;
}

interface CopingCard {
    title: string;
    description: string;
    instructions: string[];
    icon: React.ReactNode;
    gradient: string;
}

const copingStrategies: Record<string, CopingCard> = {
    sadness: {
        title: "Reflective Journaling",
        description: "Writing helps process emotions and find clarity.",
        instructions: [
            "Grab a journal or open your notes app",
            "Write freely about what you're feeling — no judgment",
            "Ask yourself: 'What would I tell a friend feeling this way?'",
            "End with one small thing you're grateful for",
        ],
        icon: <BookOpen className="w-6 h-6" />,
        gradient: "from-blue-500/20 to-indigo-500/20",
    },
    fear: {
        title: "Reassurance Exercise",
        description: "Ground yourself in safety and self-compassion.",
        instructions: [
            "Place your hand on your heart",
            "Say to yourself: 'I am safe in this moment'",
            "Name 3 things you can see right now",
            "Breathe deeply and remind yourself: 'This feeling will pass'",
        ],
        icon: <Shield className="w-6 h-6" />,
        gradient: "from-amber-500/20 to-yellow-500/20",
    },
    anger: {
        title: "Pause Technique",
        description: "Create space between the trigger and your response.",
        instructions: [
            "Stop what you're doing — pause for 10 seconds",
            "Take 3 deep, slow breaths",
            "Ask: 'What am I really upset about?'",
            "Choose one small positive action to take",
        ],
        icon: <Pause className="w-6 h-6" />,
        gradient: "from-red-500/20 to-rose-500/20",
    },
    surprise: {
        title: "Mindful Grounding",
        description: "Center yourself when things feel overwhelming.",
        instructions: [
            "Notice 5 things you can see around you",
            "Touch 4 different textures near you",
            "Listen for 3 different sounds",
            "Take 2 deep breaths and name 1 thing you're grateful for",
        ],
        icon: <TreePine className="w-6 h-6" />,
        gradient: "from-pink-500/20 to-fuchsia-500/20",
    },
    neutral: {
        title: "Mindful Breathing",
        description: "A moment of calm to check in with yourself.",
        instructions: [
            "Close your eyes gently",
            "Inhale slowly for 4 counts",
            "Hold for 4 counts",
            "Exhale slowly for 6 counts",
            "Repeat 3–5 times",
        ],
        icon: <Wind className="w-6 h-6" />,
        gradient: "from-slate-500/20 to-gray-500/20",
    },
    joy: {
        title: "Gratitude Amplifier",
        description: "Savor the positive moments and build on them.",
        instructions: [
            "Smile and take a deep breath",
            "Write down what made you feel joyful",
            "Share this moment with someone you care about",
            "Plan something small you can look forward to",
        ],
        icon: <Smile className="w-6 h-6" />,
        gradient: "from-emerald-500/20 to-green-500/20",
    },
    disgust: {
        title: "Boundary Setting",
        description: "Protect your emotional space with healthy boundaries.",
        instructions: [
            "Acknowledge what's bothering you without judgment",
            "Ask: 'Is this within my control?'",
            "If yes — make one small change",
            "If no — practice letting go with a deep breath",
        ],
        icon: <Sparkles className="w-6 h-6" />,
        gradient: "from-orange-500/20 to-amber-500/20",
    },
};

export default function CopingSuggestions({ emotion }: CopingSuggestionsProps) {
    if (!emotion) return null;

    const strategy = copingStrategies[emotion] || copingStrategies.neutral;

    return (
        <div
            className={`glass-card p-5 bg-gradient-to-br ${strategy.gradient} animate-fade-in-up`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-300">
                    {strategy.icon}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{strategy.title}</h3>
                    <p className="text-xs text-slate-400">{strategy.description}</p>
                </div>
            </div>

            {/* Steps */}
            <ol className="space-y-2">
                {strategy.instructions.map((step, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-300"
                    >
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                            {i + 1}
                        </span>
                        <span>{step}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
