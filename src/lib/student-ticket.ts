import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export interface StudentTicketData {
  ticket_token: string;
  status: "pending" | "valid" | "used" | "revoked";
}

/** The caller must first authorize the student session. */
export async function getStudentTicket(studentId: string): Promise<StudentTicketData> {
  const client = getAdminClient();
  const result = await client.from("tickets").select("ticket_token, status").eq("student_id", studentId).maybeSingle();
  if (result.error) throw result.error;
  if (result.data) return result.data as StudentTicketData;
  // Backfill only a pending ticket for accounts created before tickets were shown on sign-in.
  const created = await client.from("tickets").upsert({ student_id: studentId, status: "pending" }, { onConflict: "student_id", ignoreDuplicates: true });
  if (created.error) throw created.error;
  const ticket = await client.from("tickets").select("ticket_token, status").eq("student_id", studentId).single();
  if (ticket.error) throw ticket.error;
  return ticket.data as StudentTicketData;
}
