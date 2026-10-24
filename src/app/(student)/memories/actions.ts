"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import { MAX_MEMORY_FILE_BYTES, MEMORY_MIME_TYPES } from "@/lib/media";
import type { ActionResult } from "@/lib/admin-types";

async function hasRoom(studentId: string) {
  const { count, error } = await getAdminClient().from("memories").select("id", { head: true, count: "exact" }).eq("student_id", studentId).eq("status", "pending");
  if (error) throw error;
  return (count ?? 0) < 10;
}

export async function prepareMemoryUpload(input: { type: string; size: number }): Promise<{ ok: true; path: string; token: string } | { ok: false; message: string }> {
  const student = await requireStudent();
  if (!(await getEvent()).memoriesOpen) return { ok: false, message: "Hozircha xotiralar qabul qilinmayapti." };
  const parsed = z.object({ type: z.string(), size: z.number().int().positive().max(MAX_MEMORY_FILE_BYTES) }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Fayl bo‘sh bo‘lmasligi va 50 MB dan oshmasligi kerak." };
  const media = MEMORY_MIME_TYPES[parsed.data.type];
  if (!media) return { ok: false, message: "JPG, PNG, WebP rasm yoki MP4, WebM, MOV video tanlang." };
  if (!(await hasRoom(student.id))) return { ok: false, message: "Ko‘rib chiqilishini kutayotgan 10 ta xotirangiz bor. Tashkilotchi tasdiqlashini kuting." };
  const path = `${student.id}/${randomUUID()}.${media.extension}`;
  const { data, error } = await getAdminClient().storage.from("memories").createSignedUploadUrl(path);
  if (error) return { ok: false, message: "Fayl yuklashni tayyorlab bo‘lmadi." };
  return { ok: true, path, token: data.token };
}

export async function submitMemory(formData: FormData): Promise<ActionResult> {
  const student = await requireStudent();
  if (!(await getEvent()).memoriesOpen) return { ok: false, message: "Hozircha xotiralar qabul qilinmayapti." };
  const parsed = z.object({ caption: z.string().trim().max(500, "Matn 500 belgidan oshmasin."), filePath: z.string() }).safeParse({ caption: formData.get("caption") ?? "", filePath: formData.get("filePath") ?? "" });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Ma’lumotlarni tekshiring." };
  if (!(await hasRoom(student.id))) return { ok: false, message: "Ko‘rib chiqilishini kutayotgan xotiralaringiz ko‘p. Tashkilotchi tasdiqlashini kuting." };
  const { caption, filePath } = parsed.data;
  let kind: "text" | "image" | "video" = "text";
  const client = getAdminClient();
  if (filePath) {
    if (!filePath.startsWith(`${student.id}/`) || !/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm|mov)$/i.test(filePath)) return { ok: false, message: "Bu fayl sizning akkauntingizga tegishli emas." };
    const { data: info, error } = await client.storage.from("memories").info(filePath);
    if (error || !info) return { ok: false, message: "Yuklangan fayl topilmadi. Qayta urinib ko‘ring." };
    const mime = info.contentType ?? info.metadata?.mimetype ?? "";
    const size = info.size ?? info.metadata?.size ?? 0;
    const media = MEMORY_MIME_TYPES[mime];
    if (!media || size <= 0 || size > MAX_MEMORY_FILE_BYTES || !filePath.endsWith(`.${media.extension}`)) return { ok: false, message: "Fayl turi yoki hajmi mos emas." };
    const existing = await client.from("memories").select("id").eq("file_path", filePath).limit(1);
    if (existing.error) return { ok: false, message: "Faylni tekshirib bo‘lmadi." };
    if (existing.data?.length) return { ok: false, message: "Bu fayl allaqachon yuborilgan." };
    kind = media.kind;
  } else if (!caption) return { ok: false, message: "Xotira yozing yoki rasm/video tanlang." };
  const { error } = await client.from("memories").insert({ student_id: student.id, kind, caption: caption || null, file_path: filePath || null });
  if (error) return { ok: false, message: "Xotirani saqlab bo‘lmadi." };
  revalidatePath("/memories");
  revalidatePath("/admin/memories");
  return { ok: true };
}
