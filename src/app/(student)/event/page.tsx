import { getEvent } from "@/lib/event";
import { formatEventDay, formatTimeRange } from "@/lib/format";

export const metadata = { title: "Tadbir haqida — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

const EXPECT = [
  { icon: "🎬", text: "Barchaning ovozi bilan tanlangan film" },
  { icon: "🎵", text: "Siz taklif qilgan qo‘shiqlardan tuzilgan ro‘yxat" },
  { icon: "🎥", text: "Birga o‘tgan yillarimizdan xotiralar" },
  { icon: "🎤", text: "Samimiy tilaklar va unutilmas qiziqarli voqealar" },
  { icon: "🍓", text: "Oqshom davomida mevalar, yeguliklar, ichimliklar va popkorn" },
  { icon: "📸", text: "Birgalikda suratga tushish uchun maxsus joy" },
  { icon: "🏆", text: "Qiziqarli nominatsiyalar va esdalik sovg‘alari" },
];

export default async function EventInfoPage() {
  const event = await getEvent();

  return (
    <>
      <h1 className="auth__title" style={{ marginTop: 12 }}>
        {event.name}
      </h1>
      <p className="auth__lead">
        {formatEventDay(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)} · {event.location}
      </p>

      <section className="panel" style={{ marginTop: 20 }}>
        <h2 className="panel__title">Sizni nimalar kutmoqda?</h2>
        <ul className="reqlist" style={{ marginTop: 12 }}>
          {EXPECT.map((item) => (
            <li key={item.text} className="reqlist__row">
              <span style={{ fontSize: 20 }} aria-hidden="true">
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {event.timeline.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">Tadbir dasturi</h2>
          <ol className="timeline" style={{ marginTop: 12 }}>
            {event.timeline.map((item) => (
              <li key={`${item.time}-${item.title}`} className="timeline__row">
                <span className="timeline__time">{item.time}</span>
                <span className="timeline__title" style={{ fontSize: "1.5rem" }}>
                  {item.title}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
