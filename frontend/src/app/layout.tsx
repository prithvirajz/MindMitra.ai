import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MindMitra – AI Mental Health Companion",
  description:
    "A supportive AI companion that listens empathetically, tracks your mood, and helps you with coping strategies. Not a therapist — a caring friend.",
  keywords: ["mental health", "AI companion", "mood tracker", "emotional support"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1e2a4a",
              color: "#f1f5f9",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "12px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
