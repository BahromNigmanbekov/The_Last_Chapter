"use server";

import { timingSafeEqual, createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";
import { createAdminSession } from "@/lib/admin-session";
import { getClientKey, isThrottled, recordAttempt } from "@/lib/rate-limit";
import { createHash as hashFn } from "node:crypto";
import { adminLoginErrorMessage } from "@/lib/admin-login-errors";

export type AdminLoginState = { status: "idle" } | { status: "error"; message: string };

// Fixed subject key: throttles admin-panel guessing the same way student login is throttled.
const ADMIN_SUBJECT_KEY = hashFn("sha256").update("admin-panel-login").digest("hex");

function safeEqual(a: string, b: string): boolean {
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

export async function verifyAdminPassword(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { status: "error", message: "Boshqaruvchi parolini kiriting." };

  try {
    const ipKey = await getClientKey();
    if (await isThrottled(ipKey, ADMIN_SUBJECT_KEY)) {
      return { status: "error", message: "Urinishlar soni oshib ketdi. Bir necha daqiqadan keyin qayta urinib ko‘ring." };
    }

    const correct = safeEqual(password, serverEnv.adminPassword);
    await recordAttempt(ipKey, ADMIN_SUBJECT_KEY, correct);

    if (!correct) return { status: "error", message: "Parol noto‘g‘ri." };

    await createAdminSession();
  } catch (err) {
    console.error("[admin-login] failed:", err);
    return { status: "error", message: adminLoginErrorMessage(err) };
  }

  const { redirect } = await import("next/navigation");
  return redirect("/admin");
}
