"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import type { ActionResult } from "@/lib/admin-types";

const schema = z.object({
  artist: z.string().trim().min(1, "Ijrochi nomini kiriting.").max(100, "Matn 100 belgidan oshmasin."),
  song: z.string().trim().min(1, "Qo‘shiq nomini kiriting.").max(100, "Matn 100 belgidan oshmasin."),
});

const MAX_PENDING_PER_STUDENT = 5; // basic spam guard: a handful of open requests is plenty

export async function submitMusicRequest(formData: FormData): Promise<ActionResult> {
  const student = await requireStudent();
  const event = await getEvent();
  if (!event.musicOpen) return { ok: false, message: "Hozircha qo‘shiq takliflari qabul qilinmayapti." };

  const parsed = schema.safeParse({ artist: formData.get("artist"), song: formData.get("song") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Kiritilgan ma’lumotlarni tekshiring." };

  const admin = getAdminClient();
  const { count, error: countError } = await admin
    .from("music_requests")
    .select("id", { count: "exact", head: true })
    .eq("student_id", student.id)
    .eq("status", "pending");
  if (countError) return { ok: false, message: "Xatolik yuz berdi. Qayta urinib ko‘ring." };
  if ((count ?? 0) >= MAX_PENDING_PER_STUDENT) {
    return { ok: false, message: "Ko‘rib chiqilishini kutayotgan bir nechta taklifingiz bor." };
  }

  const { error } = await admin
    .from("music_requests")
    .insert({ student_id: student.id, artist: parsed.data.artist, song: parsed.data.song });
  if (error) return { ok: false, message: "Taklifingizni yuborib bo‘lmadi." };

  revalidatePath("/music");
  return { ok: true };
}
