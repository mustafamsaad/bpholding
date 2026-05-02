import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for the browser (client components).
 * Uses the public anon key — Row-Level Security (RLS) MUST be enabled
 * on every table that exposes data to the browser.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
