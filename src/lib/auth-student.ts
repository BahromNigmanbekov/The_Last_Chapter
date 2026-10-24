import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { readStudentSessionId } from "@/lib/session";
import type { StudentProfile } from "@/types/domain";

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  registered: boolean;
  registration_code: string;
}

/**
 * The signed-in student, or null. Re-checked against the database on every request,
 * so removing a student in the admin panel locks them out immediately.
 */
export const getCurrentStudent = cache(async (): Promise<StudentProfile | null> => {
  const id = await readStudentSessionId();
  if (!id) return null;

  const { data, error } = await getAdminClient()
    .from("students")
    .select("id, first_name, last_name, class_name, registered, registration_code")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  const row = data as StudentRow | null;
  if (!row || !row.registered) return null;

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    className: row.class_name,
    registrationCode: row.registration_code,
  };
});

/** Use at the top of every student page/action. Layout checks alone are not enough in Next.js. */
export async function requireStudent(): Promise<StudentProfile> {
  const student = await getCurrentStudent();
  if (!student) redirect("/register");
  return student;
}
