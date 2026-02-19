-- ═══════════════════════════════════════════════════════════
-- MindMitra – Supabase Database Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════

-- ─── Enable UUID Extension ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- TABLE: chats
-- Stores all chat messages (both user and AI)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chats (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    message     TEXT NOT NULL,
    emotion     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);

-- ═══════════════════════════════════════════════════════════
-- TABLE: mood_logs
-- Stores emotion detection results for analytics
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mood_logs (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     TEXT NOT NULL,
    emotion     TEXT NOT NULL,
    confidence  FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user and date range
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_created_at ON mood_logs(created_at);

-- ═══════════════════════════════════════════════════════════
-- TABLE: journal_entries
-- Stores reflection journal entries
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS journal_entries (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    mood        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own chats
CREATE POLICY "Users can read own chats"
    ON chats FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own chats
CREATE POLICY "Users can insert own chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can read their own mood logs
CREATE POLICY "Users can read own mood_logs"
    ON mood_logs FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own mood logs
CREATE POLICY "Users can insert own mood_logs"
    ON mood_logs FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can read their own journal entries
CREATE POLICY "Users can read own journal_entries"
    ON journal_entries FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own journal entries
CREATE POLICY "Users can insert own journal_entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- ═══════════════════════════════════════════════════════════
-- SERVICE ROLE BYPASS
-- The backend uses the service key to bypass RLS
-- This allows the API to read/write on behalf of any user
-- ═══════════════════════════════════════════════════════════
-- Note: The service_role key automatically bypasses RLS.
-- No additional policies needed for backend operations.

-- ═══════════════════════════════════════════════════════════
-- ✅ Migration complete!
-- ═══════════════════════════════════════════════════════════
