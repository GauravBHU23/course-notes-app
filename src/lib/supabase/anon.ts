import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// A fresh, non-persisted anon-key client for one-off operations like
// password verification during login. Never cached/shared across requests —
// unlike the admin client, each call needs its own throwaway client so one
// request's auth state can never leak into another's.
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
