/**
 * Landing Page – Redirects authenticated users to chat, shows login CTA otherwise
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Brain, MessageCircle, BarChart3, Shield, Heart, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/chat");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Empathetic Chat",
      description: "Talk to an AI that truly listens and validates your feelings",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emotion Detection",
      description: "AI-powered emotion recognition to understand your mood",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Mood Analytics",
      description: "Track your emotional journey with visual dashboards",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Crisis Safeguards",
      description: "Built-in safety measures with helpline connections",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 animate-pulse-glow">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            <span className="gradient-text">MindMitra</span>
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Your AI Mental Health Companion
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
            A caring, supportive space to explore your emotions, track your mood,
            and discover coping strategies — powered by AI, guided by empathy.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card p-6 hover:border-purple-500/40 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Ethics */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
            ⚠️ MindMitra is <strong>not</strong> a therapist or medical tool.
            It is a supportive emotional companion with crisis detection and
            ethical safeguards. If you are in crisis, please contact a
            professional helpline.
          </p>
        </div>
      </div>
    </div>
  );
}
