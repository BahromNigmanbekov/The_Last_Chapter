"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/admin-types";

export async function setMemoryStatus(
  memoryId: string,
  status: "approved" | "rejected" | "pending",
): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("memories").update({ status }).eq("id", memoryId);
  if (error) return { ok: false, message: "Xotirani yangilab bo‘lmadi." };
  revalidatePath("/admin/memories");
  revalidatePath("/memories");
  return { ok: true };
}

export async function deleteMemory(memoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const client = getAdminClient();
  const { data: memory, error: lookupError } = await client.from("memories").select("file_path").eq("id", memoryId).maybeSingle();
  if (lookupError) return { ok: false, message: "Xotirani tekshirib bo‘lmadi." };
  const { error } = await client.from("memories").delete().eq("id", memoryId);
  if (error) return { ok: false, message: "Xotirani o‘chirib bo‘lmadi." };
  if (memory?.file_path) {
    const result = await client.storage.from("memories").remove([memory.file_path]);
    if (result.error) console.error("[memories] private file cleanup failed");
  }
  revalidatePath("/admin/memories");
  revalidatePath("/memories");
  return { ok: true };
}

export async function setMemoriesOpen(open: boolean): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("events").update({ memories_open: open }).eq("slug", "main");
  if (error) return { ok: false, message: "Holatni yangilab bo‘lmadi." };
  revalidatePath("/admin/memories");
  revalidatePath("/memories");
  return { ok: true };
}
