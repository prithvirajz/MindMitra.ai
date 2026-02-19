/**
 * lib/supabase.ts – Supabase browser client (lazy initialization)
 *
 * Uses lazy initialization to prevent build-time crashes during Next.js SSG.
 * The Supabase client is only created when first accessed at runtime,
 * not during static page generation where env vars may be absent.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error(
                "Supabase URL and Anon Key must be set. Check your .env.local file."
            );
        }

        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

// Use a Proxy to lazily initialize the client on first property access
// This prevents the client from being created during module evaluation (build time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (client as any)[prop];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});
