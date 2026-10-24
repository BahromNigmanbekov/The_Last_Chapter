import { statusLabel } from "@/lib/labels";
import Link from "next/link";
import { listPayments } from "@/lib/admin-data";

export const metadata = { title: "To‘lovlar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await listPayments();
  const total = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <h1 className="admin__title">To‘lovlar</h1>

      <div className="statgrid">
        <div className="statcard statcard--wide statcard--ok">
          <span className="statcard__value">{total.toLocaleString("uz-UZ")} so‘m</span>
          <span className="statcard__label">Jami yig‘ilgan badallar</span>
        </div>
      </div>

      <section className="panel">
        <h2 className="panel__title">
          Barcha to‘lovlar <span className="panel__count">{payments.length}</span>
        </h2>
        {payments.length === 0 ? (
          <p className="panel__empty">
            Hozircha to‘lov qayd etilmagan. To‘lovni kiritish uchun o‘quvchining sahifasini oching:{" "}
            <Link href="/admin/students" className="linkbtn">
              O‘quvchilar
            </Link>
            .
          </p>
        ) : (
          <div className="admin__tablewrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>O‘quvchi</th>
                  <th>Sinf</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.student ? `${p.student.firstName} ${p.student.lastName}` : "—"}</td>
                    <td>{p.student?.className ?? "—"}</td>
                    <td>{p.amount.toLocaleString("uz-UZ")} so‘m</td>
                    <td>
                      <span className={`chip ${p.status === "paid" ? "chip--ok" : ""}`}>{statusLabel(p.status)}</span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</td>
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
