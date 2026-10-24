import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

/** Call only for rows the signed-in student or admin is allowed to see. */
export async function signMemoryFile(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await getAdminClient().storage.from("memories").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
