"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StudentOverview } from "@/lib/admin-data";

type PaymentFilter = "all" | "paid" | "pending" | "not_paid";
type EntryFilter = "all" | "entered" | "not_entered";

function paymentLabel(status: StudentOverview["paymentStatus"]): string {
  return { paid: "To‘langan", pending: "Kutilmoqda", not_paid: "To‘lanmagan", failed: "Amalga oshmagan", cancelled: "Bekor qilingan" }[status];
}

export function StudentsTable({
  students,
  classes,
  minContribution,
}: {
  students: StudentOverview[];
  classes: string[];
  minContribution: number;
}) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [entryFilter, setEntryFilter] = useState<EntryFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !`${s.firstName} ${s.lastName} ${s.registrationCode}`.toLowerCase().includes(q)) return false;
      if (classFilter !== "all" && s.className !== classFilter) return false;
      if (paymentFilter !== "all" && s.paymentStatus !== paymentFilter) return false;
      if (entryFilter === "entered" && !s.entered) return false;
      if (entryFilter === "not_entered" && s.entered) return false;
      return true;
    });
  }, [students, query, classFilter, paymentFilter, entryFilter]);

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          Barcha o‘quvchilar <span className="panel__count">{filtered.length}</span>
        </h2>
      </div>

      <div className="admin__filters">
        <input
          className="field__input"
          placeholder="Ism yoki kod bo‘yicha qidirish…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="field__input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">Barcha sinflar</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="field__input"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
        >
          <option value="all">Barcha to‘lov holatlari</option>
          <option value="paid">To‘langan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="not_paid">To‘lanmagan</option>
        </select>
        <select
          className="field__input"
          value={entryFilter}
          onChange={(e) => setEntryFilter(e.target.value as EntryFilter)}
        >
          <option value="all">Barcha kirish holatlari</option>
          <option value="entered">Kirgan</option>
          <option value="not_entered">Kirmagan</option>
        </select>
      </div>

      <div className="admin__tablewrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Ism-familiya</th>
              <th>Sinf</th>
              <th>Shaxsiy kod</th>
              <th>Ro‘yxatdan o‘tgan</th>
              <th>To‘lov</th>
              <th>Kirish</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/students/${s.id}`} className="admin__rowlink">
                    {s.firstName} {s.lastName}
                  </Link>
                </td>
                <td>{s.className}</td>
                <td className="admin__mono">{s.registrationCode}</td>
                <td>
                  {s.registered ? (
                    <span className="chip chip--ok">Ro‘yxatdan o‘tgan</span>
                  ) : (
                    <span className="chip">Hali yo‘q</span>
                  )}
                </td>
                <td>
                  <span className={`chip ${s.paymentStatus === "paid" ? "chip--ok" : ""}`}>
                    {paymentLabel(s.paymentStatus)}
                    {s.paymentStatus === "paid" && s.amountPaid !== minContribution
                      ? ` · ${s.amountPaid.toLocaleString("uz-UZ")} so‘m`
                      : ""}
                  </span>
                </td>
                <td>
                  {s.entered ? <span className="chip chip--ok">Kirgan</span> : <span className="chip">Hali yo‘q</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin__empty">
                  Bu filtrlarga mos o‘quvchi topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
