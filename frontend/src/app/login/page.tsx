/**
 * Login Page – Supabase email auth + optional Google OAuth
 *
 * Beautiful login form with glassmorphism design.
 * Supports both email/password and magic link login.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Brain, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Sign up with email/password
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Account created! Please check your email to verify.");
            } else {
                // Sign in with email/password
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Welcome back! 💙");
                router.push("/chat");
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Authentication failed";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/chat`,
                },
            });
            if (error) throw error;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Google login failed";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/30 animate-pulse-glow">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">MindMitra</h1>
                    <p className="text-slate-400 text-sm">
                        Your supportive AI mental health companion 💙
                    </p>
                </div>

                {/* Auth Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? "Sign Up" : "Sign In"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-purple-500/20" />
                        <span className="text-xs text-slate-500 uppercase">or</span>
                        <div className="flex-1 h-px bg-purple-500/20" />
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Toggle Sign Up / Sign In */}
                    <p className="text-center text-sm text-slate-400 mt-5">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </p>
                </div>

                {/* Ethics Notice */}
                <p className="text-center text-xs text-slate-500 mt-6 px-4 leading-relaxed">
                    <Sparkles className="inline w-3 h-3 mr-1" />
                    MindMitra is a supportive AI companion, not a therapist or medical
                    tool. If you&apos;re in crisis, please contact a helpline.
                </p>
            </div>
        </div>
    );
}
