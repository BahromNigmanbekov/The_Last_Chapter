"use client";

import { createClient } from "@supabase/supabase-js";

/** Public key only. Private media uploads additionally require a server-issued token. */
export function getBrowserClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
