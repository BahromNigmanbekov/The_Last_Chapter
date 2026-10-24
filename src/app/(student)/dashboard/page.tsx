import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { StudentTicket } from "@/components/StudentTicket";
import { Emoji } from "@/components/ui/Emoji";
import { requireStudent } from "@/lib/auth-student";
import { getStudentTicket } from "@/lib/student-ticket";
import { getEvent } from "@/lib/event";
import { formatEventDay, formatTimeRange } from "@/lib/format";

export const metadata = { title: "Shaxsiy kabinet — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

const SECTIONS = [
  { icon: "🎟️", title: "Mening chiptam", text: "Shaxsiy kod, chipta raqami va QR-kodingiz.", href: "/ticket" },
  { icon: "🎬", title: "Filmga ovoz berish", text: "Oqshom uchun filmni birga tanlaymiz.", href: "/movie" },
  { icon: "🎵", title: "Musiqa", text: "Sevimli qo‘shig‘ingizni taklif qiling.", href: "/music" },
  { icon: "🎥", title: "Videolar", text: "Maktab yillaridan videolarni ulashing va tomosha qiling.", href: "/memories?type=video" },
  { icon: "📸", title: "Rasmlar", text: "Esdalik suratlarni yuklang va ko‘ring.", href: "/memories?type=image" },
  { icon: "💭", title: "Xotiralar", text: "Unutilmas voqealarimizni yozib qoldiramiz.", href: "/memories" },
  { icon: "🗓️", title: "Tadbir dasturi", text: "Oqshom jadvali, manzil va boshqa tafsilotlar.", href: "/event" },
];

export default async function DashboardPage() {
  const student = await requireStudent();
  const [event, ticket] = await Promise.all([getEvent(), getStudentTicket(student.id)]);
  return <>
    <section className="welcome"><h1 className="welcome__title">Xush kelibsiz, {student.firstName} <Emoji>👋</Emoji></h1><span className="chip">{student.className}</span><span className="chip chip--ok">Ro‘yxatdan o‘tgan</span></section>
    <section className="eventcard"><div><span className="eyebrow">Bizning oqshom</span><h2 className="eventcard__name">{event.name}</h2><p className="eventcard__meta"><strong>{formatEventDay(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}</strong><span>{event.location}</span></p></div><div><p className="account-countdown-label">Uchrashuvimizgacha qolgan vaqt</p><Countdown startsAt={event.startsAt} endsAt={event.endsAt} serverNow={new Date().toISOString()} /></div></section>
    <div className="account-sections-heading"><h2>Kabinetingizdagi bo‘limlar</h2><p>Film, musiqa va eng yaxshi xotiralar — hammasi shu yerda.</p></div>
    <nav className="tiles" aria-label="Tadbir bo‘limlari">{SECTIONS.map(section => <Link key={section.href} href={section.href} className="tile"><span className="tile__icon"><Emoji>{section.icon}</Emoji></span><span><span className="tile__title">{section.title}</span><span className="tile__text">{section.text}</span></span><span className="tile__arrow" aria-hidden="true">↗︎</span></Link>)}</nav>
    <div className="account-sections-heading"><h2>Kodingiz va chiptangiz</h2><p>Bu ma’lumotlar akkauntingizda saqlanadi. Sahifani yangilasangiz ham shu yerda qoladi.</p></div>
    <StudentTicket student={student} event={event} ticket={ticket} />
  </>;
}
