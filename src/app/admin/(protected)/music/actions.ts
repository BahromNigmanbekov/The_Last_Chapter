"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/admin-types";

export async function setMusicRequestStatus(
  requestId: string,
  status: "approved" | "rejected" | "pending",
): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("music_requests").update({ status }).eq("id", requestId);
  if (error) return { ok: false, message: "Taklifni yangilab bo‘lmadi." };
  revalidatePath("/admin/music");
  return { ok: true };
}

export async function setMusicOpen(open: boolean): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("events").update({ music_open: open }).eq("slug", "main");
  if (error) return { ok: false, message: "Holatni yangilab bo‘lmadi." };
  revalidatePath("/admin/music");
  revalidatePath("/music");
  return { ok: true };
}
