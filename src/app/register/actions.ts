"use server";

import { getEvent } from "@/lib/event";
import { getAdminClient } from "@/lib/supabase/admin";
import { createStudentSession } from "@/lib/session";
import { getClientKey, getSubjectKey, isThrottled, recordAttempt } from "@/lib/rate-limit";
import { normalizeClass, normalizeName, registrationSchema } from "@/lib/validation";

export type RegisterField = "firstName" | "lastName" | "className";

export interface RegisterValues {
  firstName: string;
  lastName: string;
  className: string;
}

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<RegisterField, string>>; values: RegisterValues }
  | { status: "success"; firstName: string };

interface StudentLookup {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  registered: boolean;
}

const NOT_FOUND = "Ma’lumotlaringiz ro‘yxatdan topilmadi. Ularni tekshirib ko‘ring.";

function readValues(formData: FormData): RegisterValues {
  const get = (name: string) => String(formData.get(name) ?? "");
  return { firstName: get("firstName"), lastName: get("lastName"), className: get("className") };
}

export async function verifyStudent(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const values = readValues(formData);

  // 1. Server-side validation (the browser's checks are only a convenience).
  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<RegisterField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RegisterField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", message: "Belgilangan maydonlardagi xatolarni tuzating.", fieldErrors, values };
  }
  const input = parsed.data;

  try {
    // 2. Throttle guessing (per network and per student identity).
    const ipKey = await getClientKey();
    const subjectKey = getSubjectKey(input.firstName, input.lastName, input.className);
    if (await isThrottled(ipKey, subjectKey)) {
      return { status: "error", message: "Urinishlar soni oshib ketdi. Bir necha daqiqadan keyin qayta urinib ko‘ring.", values };
    }

    // 3. Match only the organizer's approved list. Do not guess between namesakes.
    const { data, error } = await getAdminClient()
      .from("students")
      .select("id, first_name, last_name, class_name, registered")
      .eq("first_name_key", normalizeName(input.firstName))
      .eq("last_name_key", normalizeName(input.lastName))
      .eq("class_key", normalizeClass(input.className))
      .limit(2);
    if (error) throw error;

    const candidates = (data ?? []) as StudentLookup[];
    if (candidates.length > 1) {
      await recordAttempt(ipKey, subjectKey, false);
      return { status: "error", message: "Ro‘yxatda bir xil ma’lumotli o‘quvchilar bor. Tashkilotchiga murojaat qiling.", values };
    }
    const student = candidates[0];
    if (!student) {
      await recordAttempt(ipKey, subjectKey, false);
      return { status: "error", message: NOT_FOUND, values };
    }

    // 4. First-time registration respects the admin's open/closed switch.
    //    Students who already registered can always sign back in (new phone, cleared cookies).
    if (!student.registered) {
      const event = await getEvent();
      if (!event.registrationOpen) {
        return { status: "error", message: "Hozircha ro‘yxatdan o‘tish yopiq.", values };
      }
      const { error: updateError } = await getAdminClient()
        .from("students")
        .update({ registered: true, registered_at: new Date().toISOString() })
        .eq("id", student.id);
      if (updateError) throw updateError;
    }

    // Preserve any existing paid, used, or revoked ticket on subsequent logins.
    const { error: ticketError } = await getAdminClient().from("tickets")
      .upsert({ student_id: student.id, status: "pending" }, { onConflict: "student_id", ignoreDuplicates: true });
    if (ticketError) throw ticketError;

    await createStudentSession(student.id);
    await recordAttempt(ipKey, subjectKey, true);
    return { status: "success", firstName: student.first_name };
  } catch (err) {
    console.error("[register] verification failed:", err);
    return { status: "error", message: "Serverda xatolik yuz berdi. Qayta urinib ko‘ring.", values };
  }
}
