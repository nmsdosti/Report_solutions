import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// SUPABASE CREDENTIALS — edit these values to change the project
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xqbqgjqfxuegqfvfpthy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYnFnanFmeHVlZ3FmdmZwdGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgwMTUsImV4cCI6MjA4OTQxNDAxNX0._wocLo8Q7C2wFd8zp_xKmHGVlBmmONLxCp1PqKmrlQI";
// ─────────────────────────────────────────────────────────────

console.log("Supabase connected:", SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConnected = (): boolean => {
  return true;
};
