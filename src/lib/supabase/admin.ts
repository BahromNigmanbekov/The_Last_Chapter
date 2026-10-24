import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Service-role client. Bypasses RLS, so it must only be used in server code
 * AFTER the caller has been authorized (student session or admin check).
 * `server-only` makes the build fail if this is ever imported into client code.
 */
export function getAdminClient(): SupabaseClient {
  client ??= createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
