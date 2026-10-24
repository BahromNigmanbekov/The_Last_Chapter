import { renderQrSvg } from "@/lib/qrcode";
import { formatEventDay, formatTimeRange } from "@/lib/format";
import type { StudentTicketData } from "@/lib/student-ticket";
import type { EventInfo, StudentProfile } from "@/types/domain";

const ticketLabels = { pending: "To‘lov tasdiqlanishi kutilmoqda", valid: "Chipta faol", used: "Kirish qayd etilgan", revoked: "Chipta bekor qilingan" };

export async function StudentTicket({ student, event, ticket }: { student: StudentProfile; event: EventInfo; ticket: StudentTicketData }) {
  const qr = await renderQrSvg(ticket.ticket_token);
  return <section className="account-ticket" aria-labelledby="account-ticket-title">
    <div className="account-ticket__top"><span>{event.subtitle}</span><span className={`chip ${ticket.status === "valid" || ticket.status === "used" ? "chip--ok" : ""}`}>{ticketLabels[ticket.status]}</span></div>
    <h2 id="account-ticket-title">THE LAST CHAPTER</h2>
    <div className="account-ticket__body"><div className="account-ticket__identity"><p className="account-ticket__name">{student.firstName} {student.lastName}</p><span>{student.className} sinf</span><dl><div><dt>Shaxsiy kod</dt><dd data-testid="personal-code">{student.registrationCode}</dd></div><div><dt>Chipta raqami</dt><dd data-testid="ticket-number">{ticket.ticket_token}</dd></div><div><dt>Uchrashuv</dt><dd>{formatEventDay(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}</dd></div><div><dt>Manzil</dt><dd>{event.location}</dd></div></dl></div><div className="account-ticket__qr"><div className="qrbox" dangerouslySetInnerHTML={{ __html: qr }} /><span>Shaxsiy QR-chiptangiz</span></div></div>
    <p className={`account-ticket__notice ${ticket.status === "pending" || ticket.status === "revoked" ? "account-ticket__notice--pending" : ""}`}>
      {ticket.status === "pending" ? `QR-kod tayyor. Kirish uchun kamida ${event.minContribution.toLocaleString("uz-UZ")} so‘m badalingiz tashkilotchi tomonidan tasdiqlanishi kerak. Hozircha bu chipta bilan kirish tasdiqlanmagan.` : ticket.status === "revoked" ? "Bu chipta kirish uchun amal qilmaydi. Tashkilotchiga murojaat qiling." : ticket.status === "used" ? "Ushbu chipta bilan tadbirga kirish qayd etilgan." : "Kirishda shu QR-kodni ko‘rsating."}
    </p>
  </section>;
}
