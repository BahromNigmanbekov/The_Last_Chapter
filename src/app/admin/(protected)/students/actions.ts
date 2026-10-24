"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { normalizeClass, normalizeCode, normalizeName } from "@/lib/validation";
import type { ActionResult } from "@/lib/admin-types";

const addSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  className: z.string().trim().min(1).max(10),
  code: z.string().trim().max(32).optional().transform((value) => value || undefined),
});

/** One student per line: Ism,Familiya,Sinf; a fourth personal code is optional. */
const importSchema = z.string().min(1);

export async function addStudent(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = addSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    className: formData.get("className"),
    code: formData.get("code") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Barcha maydonlarni to‘ldiring." };

  const { error } = await getAdminClient().from("students").insert({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    class_name: parsed.data.className,
    registration_code: parsed.data.code,
  });
  if (error) {
    const message = error.code === "23505" ? "Bu ro‘yxatdan o‘tish kodi allaqachon ishlatilgan." : "O‘quvchini qo‘shib bo‘lmadi.";
    return { ok: false, message };
  }

  revalidatePath("/admin/students");
  return { ok: true };
}

export async function importStudents(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const raw = importSchema.safeParse(formData.get("csv"));
  if (!raw.success) return { ok: false, message: "Kamida bitta qator kiriting." };

  const rows = raw.data
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(first[_ ]?name|ism)\s*,/i.test(line)) // skip an optional header row
    .map((line) => line.split(",").map((cell) => cell.trim()));

  const students: { first_name: string; last_name: string; class_name: string; registration_code?: string }[] = [];
  const existing = await getAdminClient().from("students").select("first_name_key, last_name_key, class_key");
  if (existing.error) return { ok: false, message: "Mavjud ro‘yxatni tekshirib bo‘lmadi." };
  const identities = new Set((existing.data ?? []).map(row => JSON.stringify([row.first_name_key, row.last_name_key, row.class_key])));
  for (const [index, cells] of rows.entries()) {
    const [firstName, lastName, className, code] = cells;
    const parsed = addSchema.safeParse({ firstName, lastName, className, code: code || undefined });
    if (!parsed.success) return { ok: false, message: `${index + 1}-qatordagi ma’lumotlarni tekshiring. Shakl: Ism,Familiya,Sinf.` };
    const value = parsed.data;
    const identity = JSON.stringify([normalizeName(value.firstName), normalizeName(value.lastName), normalizeClass(value.className)]);
    if (identities.has(identity)) continue;
    identities.add(identity);
    students.push({ first_name: value.firstName, last_name: value.lastName, class_name: value.className, ...(value.code ? { registration_code: normalizeCode(value.code) } : {}) });
  }
  if (rows.length === 0) return { ok: false, message: "Kamida bitta o‘quvchi kiriting: Ism,Familiya,Sinf." };
  if (students.length === 0) return { ok: true, message: "Bu o‘quvchilar ro‘yxatda allaqachon bor." };
  const { error, count } = await getAdminClient().from("students")
    .upsert(students, { onConflict: "registration_code", ignoreDuplicates: true, count: "exact", defaultToNull: false });
  if (error) return { ok: false, message: "Ro‘yxatni kiritib bo‘lmadi. Qatorlar va shaxsiy kodlarni tekshiring." };

  revalidatePath("/admin/students");
  return { ok: true, message: `${count ?? students.length} ta o‘quvchi kiritildi. Takroriy o‘quvchilar va kodlar o‘tkazib yuborildi.` };
}

export async function updateStudent(studentId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = addSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    className: formData.get("className"),
    code: formData.get("code") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Barcha maydonlarni to‘ldiring." };

  const { error } = await getAdminClient()
    .from("students")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      class_name: parsed.data.className,
      ...(parsed.data.code ? { registration_code: normalizeCode(parsed.data.code) } : {}),
    })
    .eq("id", studentId);
  if (error) {
    const message = error.code === "23505" ? "Bu ro‘yxatdan o‘tish kodi allaqachon ishlatilgan." : "O‘zgarishlarni saqlab bo‘lmadi.";
    return { ok: false, message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}

export async function deleteStudent(studentId: string): Promise<ActionResult> {
  await requireAdmin();
  const client = getAdminClient();
  const { data: memories, error: memoryError } = await client.from("memories").select("file_path").eq("student_id", studentId);
  if (memoryError) return { ok: false, message: "O‘quvchining fayllarini tekshirib bo‘lmadi." };
  const { error } = await client.from("students").delete().eq("id", studentId);
  if (error) return { ok: false, message: "O‘quvchini o‘chirib bo‘lmadi." };
  const paths = (memories ?? []).flatMap(memory => memory.file_path ? [memory.file_path] : []);
  if (paths.length) {
    const cleanup = await client.storage.from("memories").remove(paths);
    if (cleanup.error) console.error("[students] private media cleanup failed");
  }
  revalidatePath("/admin/students");
  return { ok: true };
}

const paymentSchema = z.object({
  amount: z.coerce.number().int().positive(),
  status: z.enum(["pending", "paid", "failed", "cancelled"]),
});

/** Manual payment recording until a real payment provider is connected (see README). */
export async function recordPayment(studentId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = paymentSchema.safeParse({ amount: formData.get("amount"), status: formData.get("status") });
  if (!parsed.success) return { ok: false, message: "To‘g‘ri summa va holatni kiriting." };

  const admin = getAdminClient();
  const { error: paymentError } = await admin.from("payments").insert({
    student_id: studentId,
    amount: parsed.data.amount,
    status: parsed.data.status,
    provider: "manual",
    paid_at: parsed.data.status === "paid" ? new Date().toISOString() : null,
  });
  if (paymentError) return { ok: false, message: "To‘lovni qayd etib bo‘lmadi." };

  if (parsed.data.status === "paid") {
    const [{ data: payments, error: sumError }, { data: event, error: eventError }, { data: existing, error: existingError }] = await Promise.all([
      admin.from("payments").select("amount").eq("student_id", studentId).eq("status", "paid"),
      admin.from("events").select("min_contribution").eq("slug", "main").single(),
      admin.from("tickets").select("id, status").eq("student_id", studentId).maybeSingle(),
    ]);
    if (sumError || eventError || existingError) return { ok: false, message: "To‘lov saqlandi, lekin chipta holatini tekshirib bo‘lmadi." };
    const total = (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
    if (total >= event.min_contribution) {
      const result = existing
        ? await admin.from("tickets").update({ status: "valid" }).eq("id", existing.id).eq("status", "pending")
        : await admin.from("tickets").insert({ student_id: studentId, status: "valid" });
      if (result.error) return { ok: false, message: "To‘lov saqlandi, lekin chipta faollashmadi." };
    }
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/ticket");
  return { ok: true };
}
