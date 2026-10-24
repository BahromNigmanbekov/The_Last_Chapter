import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { normalizeClass, normalizeName } from "@/lib/validation";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_IP = 8;
const MAX_FAILURES_PER_STUDENT = 10;

function hash(value: string): string {
  return createHash("sha256").update(`${serverEnv.sessionSecret}:${value}`).digest("hex");
}

export async function getClientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return hash(`ip:${ip}`);
}

export function getSubjectKey(firstName: string, lastName: string, className: string): string {
  return hash(`student:${normalizeName(firstName)}|${normalizeName(lastName)}|${normalizeClass(className)}`);
}

async function countRecentFailures(column: "ip_hash" | "subject_hash", value: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await getAdminClient()
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .eq("success", false)
    .gte("created_at", since);
  if (error) throw error; // fail closed: never skip throttling silently
  return count ?? 0;
}

/**
 * Two independent limits: per device/network (stops one person guessing widely) and
 * per student identity (stops guessing one classmate's code from many devices).
 */
export async function isThrottled(ipKey: string, subjectKey: string): Promise<boolean> {
  const [byIp, bySubject] = await Promise.all([
    countRecentFailures("ip_hash", ipKey),
    countRecentFailures("subject_hash", subjectKey),
  ]);
  return byIp >= MAX_FAILURES_PER_IP || bySubject >= MAX_FAILURES_PER_STUDENT;
}

export async function recordAttempt(ipKey: string, subjectKey: string, success: boolean): Promise<void> {
  const { error } = await getAdminClient()
    .from("login_attempts")
    .insert({ ip_hash: ipKey, subject_hash: subjectKey, success });
  if (error) console.error("[rate-limit] could not record attempt:", error.message);
}
