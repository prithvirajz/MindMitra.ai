/**
 * Navbar.tsx – Navigation bar for MindMitra
 *
 * Shows navigation links and user logout button.
 * Uses a glassmorphism style with purple accents.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    MessageCircle,
    BarChart3,
    BookOpen,
    LogOut,
    Brain,
} from "lucide-react";

const navItems = [
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/journal", label: "Journal", icon: BookOpen },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/chat" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:inline">
                            MindMitra
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                            ? "bg-purple-500/20 text-purple-300 shadow-sm"
                                            : "text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 ml-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
