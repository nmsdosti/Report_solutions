import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// SUPABASE CREDENTIALS — edit these values to change the project
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xqbqgjqfxuegqfvfpthy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYnFnanFmeHVlZ3FmdmZwdGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgwMTUsImV4cCI6MjA4OTQxNDAxNX0._wocLo8Q7C2wFd8zp_xKmHGVlBmmONLxCp1PqKmrlQI";
// ─────────────────────────────────────────────────────────────

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing — check src/lib/supabase.ts");
} else {
  console.log("Supabase connected:", supabaseUrl);
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConnected = (): boolean => {
  return !!supabase;
};
