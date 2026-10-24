import Link from "next/link";
import { StudentTicket } from "@/components/StudentTicket";
import { requireStudent } from "@/lib/auth-student";
import { getStudentTicket } from "@/lib/student-ticket";
import { getEvent } from "@/lib/event";

export const metadata = { title: "Mening chiptam — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

export default async function TicketPage() {
  const student = await requireStudent();
  const [event, ticket] = await Promise.all([getEvent(), getStudentTicket(student.id)]);
  return <><Link href="/dashboard" className="linkbtn">← Shaxsiy kabinetga qaytish</Link><h1 className="auth__title" style={{ marginBlock: 20 }}>Mening chiptam</h1><StudentTicket student={student} event={event} ticket={ticket} /></>;
}
