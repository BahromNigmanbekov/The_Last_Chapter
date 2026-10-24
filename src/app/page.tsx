import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/ui/Reveal";
import { Emoji } from "@/components/ui/Emoji";
import { buttonClass } from "@/components/ui/Button";
import { getEvent } from "@/lib/event";
import { formatEventDay, formatTimeRange } from "@/lib/format";

export const dynamic = "force-dynamic";

const EXPERIENCES = [
  { key: "movie", icon: "🎬", title: "Bitta film. Barchamiz birga.", text: "Filmni o‘zimiz tanlaymiz. Katta ekran, popkorn va yonimizda eng yaqin insonlar.", label: "Kino oqshomi", href: "/movie", action: "Filmga ovoz berish" },
  { key: "music", icon: "🎵", title: "Oqshom ohangi — sizdan.", text: "Sevimli qo‘shig‘ingizni taklif qiling. Bu kechani o‘zimizning qo‘shiqlarimiz bilan eslab qolamiz.", label: "Musiqa", href: "/music", action: "Qo‘shiq taklif qilish" },
  { key: "memories", icon: "💭", title: "Esingdami, o‘shanda…", text: "Maktabdagi kulgili, hayajonli va unutilmas voqealarni yana bir bor eslaymiz.", label: "Xotiralar", href: "/memories", action: "Xotira ulashish" },
  { key: "stories", icon: "🎤", title: "Aytilmagan tilaklar.", text: "Samimiy so‘zlar, qiziqarli hikoyalar va bir-birimizga aytadigan yaxshi gaplar.", label: "Suhbatlar" },
  { key: "snacks", icon: "🍓", title: "Suhbatga yarasha dasturxon.", text: "Mevalar, yeguliklar, ichimliklar va, albatta, popkorn.", label: "Yeguliklar" },
  { key: "photo", icon: "📸", title: "Yana bitta umumiy surat.", text: "Yillar o‘tsa ham qayta-qayta ko‘rgimiz keladigan lahzalar.", label: "Suratlar" },
  { key: "awards", icon: "🏆", title: "Har birimiz o‘zgachamiz.", text: "Qiziqarli nominatsiyalar, kichik sovg‘alar va katta quvonch.", label: "Esdaliklar" },
];

export default async function HomePage() {
  const event = await getEvent();
  const serverNow = new Date().toISOString();
  const day = formatEventDay(event.startsAt);
  const times = formatTimeRange(event.startsAt, event.endsAt);

  return (
    <div className="landing">
      <main>
        <section className="event-hero" aria-labelledby="hero-title">
          <div className="event-hero__decoration" aria-hidden="true"><span>✳︎</span><span>birga bo‘lsak bas.</span><span>✧</span></div>
          <p className="event-hero__class">{event.subtitle}<span>Bitiruv oqshomi</span></p>
          <h1 id="hero-title" className="event-hero__title">THE LAST<br /><span>CHAPTER</span></h1>
          <p className="event-hero__note">Bir davr tugaydi. Xotiralar qoladi.</p>
          <p className="event-hero__description">Ikkita sinf. Shuncha hikoya. Maktabdagi so‘nggi kunlarimizni<br className="desktop-break" /> samimiy bir oqshom bilan eslab qolamiz.</p>
          <div className="event-hero__actions">
            <Link href="/register" className={buttonClass("primary")}>Men ham boraman <span aria-hidden="true">↗︎</span></Link>
            <a href="#program" className="text-link">Oqshom dasturi <span aria-hidden="true">↓</span></a>
          </div>
          <div className="event-hero__countdown"><span>Uchrashuvimizgacha</span><Countdown startsAt={event.startsAt} endsAt={event.endsAt} serverNow={serverNow} variant="compact" /></div>
        </section>

        <Reveal><dl className="event-facts" aria-label="Tadbir tafsilotlari">
          <div><dt>Qachon uchrashamiz?</dt><dd>{day}<small>{times}</small></dd></div>
          <div><dt>Qayerda?</dt><dd>{event.location}<small>Ikkita 11-sinf uchun</small></dd></div>
          <div><dt>Badal miqdori</dt><dd>{event.minContribution.toLocaleString("uz-UZ")} so‘mdan<small>Tashkilotchi orqali tasdiqlanadi</small></dd></div>
        </dl></Reveal>

        <section id="moments" className="section experiences" aria-labelledby="moments-title">
          <div className="section__heading"><div><span className="eyebrow">Shu oqshomda</span><h2 id="moments-title">Bizni nimalar <em>kutmoqda?</em></h2></div><p>Rejamiz oddiy: birga bo‘lish,<br />yaxshi kayfiyat va yangi xotiralar.</p></div>
          <div className="experience-grid">
            {EXPERIENCES.map((item, index) => <Reveal key={item.key} delay={(index % 3) * 80} className={`experience-cell experience-cell--${item.key}`}>
              <article className={`experience-card experience-card--${item.key}`}>
                <div className="experience-card__top"><Emoji>{item.icon}</Emoji><span>{item.label}</span></div>
                <div className="experience-card__body"><h3>{item.title}</h3><p>{item.text}</p></div>
                {"href" in item && <Link href={item.href!} className="text-link">{item.action}<span aria-hidden="true">↗︎</span></Link>}
                {item.key === "movie" && <div className="cinema-strip" aria-hidden="true"><span /><span /><span /><span /></div>}
              </article>
            </Reveal>)}
          </div>
        </section>

        {event.timeline.length > 0 && <section id="program" className="section program-section" aria-labelledby="timeline-title">
          <div className="section__heading"><div><span className="eyebrow">Oqshom dasturi</span><h2 id="timeline-title">Har bir lahzasi <em>qadrli.</em></h2></div><span className="program-date">{day}<small>{times}</small></span></div>
          <ol className="event-schedule">{event.timeline.map((item, index) => <li className="schedule-step" key={`${item.time}-${item.title}`} data-reveal="up" data-delay={(index % 3) * 70}>
            <span className="schedule-step__time">{item.time}</span><span className="schedule-step__dot" aria-hidden="true" /><h3>{item.title}</h3><span className="schedule-step__number" aria-hidden="true">0{index + 1}</span>
          </li>)}</ol>
          <p className="program-footnote">* Eng yaxshi lahzalar esa kutilmaganda keladi.</p>
        </section>}

        <section className="section invitation" aria-labelledby="invitation-title">
          <Reveal direction="left" className="invitation__message"><span className="eyebrow">Sizni kutamiz</span><h2 id="invitation-title">Bu kecha<br /><em>bizniki.</em></h2><p>Rasmiy marosim emas. O‘zimizning davramiz.<br />Kulamiz, eslaymiz, kelajak haqida gaplashamiz.</p><span className="invitation__signature">So‘nggi sahifani birga yozamiz. <span aria-hidden="true">♡</span></span></Reveal>
          <Reveal direction="right" delay={100} className="invitation__ticket-wrap"><div className="invitation-ticket"><div className="invitation-ticket__head"><span>Bitiruv oqshomiga taklifnoma</span><Emoji>🎟️</Emoji></div><p className="invitation-ticket__brand">THE LAST<br />CHAPTER</p><div className="invitation-ticket__details"><span>{day}<small>{times}</small></span><span>{event.location}</span></div><div className="invitation-ticket__bottom"><p>Joyingiz bizning yonimizda.</p><Link href="/register" className={buttonClass("primary")}>Chiptamni olish <span aria-hidden="true">↗︎</span></Link></div></div></Reveal>
        </section>
      </main>

      <footer className="footer"><Link href="/" className="brand">THE LAST CHAPTER</Link><span>{event.subtitle}</span><a href="#hero-title">Tepaga qaytish ↑︎</a></footer>
    </div>
  );
}
