import { statusLabel } from "@/lib/labels";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import { renderQrSvg } from "@/lib/qrcode";
import { firstRelated } from "@/lib/relations";
import { EditStudentForm } from "./EditStudentForm";
import { PaymentForm } from "./PaymentForm";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

interface StudentDetailRow {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  registration_code: string;
  registered: boolean;
  payments: { id: string; amount: number; status: string; created_at: string; provider: string | null }[];
  tickets: { ticket_token: string; status: string } | { ticket_token: string; status: string }[] | null;
  entries: { entered_at: string }[];
}

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data, error }, event] = await Promise.all([
    getAdminClient()
      .from("students")
      .select(
        "id, first_name, last_name, class_name, registration_code, registered, payments(id, amount, status, created_at, provider), tickets(ticket_token, status), entries(entered_at)",
      )
      .eq("id", id)
      .maybeSingle(),
    getEvent(),
  ]);
  if (error) throw error;
  const student = data as StudentDetailRow | null;
  if (!student) notFound();

  const ticket = firstRelated(student.tickets);
  const entry = student.entries[0] ?? null;
  const qrSvg = ticket ? await renderQrSvg(ticket.ticket_token) : null;

  return (
    <>
      <p>
        <Link href="/admin/students" className="linkbtn">
          ← Barcha o‘quvchilar
        </Link>
      </p>
      <h1 className="admin__title">
        {student.first_name} {student.last_name}
      </h1>

      <div className="admin__grid2">
        <section className="panel">
          <h2 className="panel__title">Ma’lumotlar</h2>
          <EditStudentForm student={student} />
          <div className="admin__danger">
            <DeleteButton studentId={student.id} />
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Kirish chiptasi</h2>
          {ticket ? (
            <>
              <div className="qrbox">{qrSvg && <div dangerouslySetInnerHTML={{ __html: qrSvg }} />}</div>
              <p className="admin__mono" style={{ textAlign: "center" }}>
                {ticket.ticket_token}
              </p>
              <p style={{ textAlign: "center" }}>
                {entry ? (
                  <span className="chip chip--ok">Kirgan vaqti: {new Date(entry.entered_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</span>
                ) : (
                  <span className="chip">Hali kirmagan</span>
                )}
              </p>
            </>
          ) : (
            <p className="panel__empty">Hozircha chipta yo‘q. Yaratish uchun quyida tasdiqlangan to‘lovni qayd eting.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2 className="panel__title">To‘lovni qayd etish</h2>
        <PaymentForm studentId={student.id} defaultAmount={event.minContribution} />
      </section>

      <section className="panel">
        <h2 className="panel__title">To‘lovlar tarixi</h2>
        {student.payments.length === 0 ? (
          <p className="panel__empty">Hozircha to‘lov qayd etilmagan.</p>
        ) : (
          <div className="admin__tablewrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {student.payments
                  .slice()
                  .sort((a, b) => b.created_at.localeCompare(a.created_at))
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.amount.toLocaleString("uz-UZ")} so‘m</td>
                      <td>
                        <span className={`chip ${p.status === "paid" ? "chip--ok" : ""}`}>{statusLabel(p.status)}</span>
                      </td>
                      <td>{new Date(p.created_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
