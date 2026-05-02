import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client backed by the SERVICE ROLE key.
 * NEVER import this from a client component.
 * Use only in Route Handlers / Server Actions for admin operations
 * that intentionally bypass Row-Level Security.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
