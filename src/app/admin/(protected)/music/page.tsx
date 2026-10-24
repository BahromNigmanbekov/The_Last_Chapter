import { listMusicRequests } from "@/lib/admin-data";
import { getEvent } from "@/lib/event";
import { setMusicOpen } from "./actions";
import { OpenToggle } from "./OpenToggle";
import { MusicList } from "./MusicList";

export const metadata = { title: "Qo‘shiqlar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminMusicPage() {
  const [requests, event] = await Promise.all([listMusicRequests(), getEvent()]);

  return (
    <>
      <h1 className="admin__title">Qo‘shiq takliflari</h1>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Takliflar</h2>
          <OpenToggle open={event.musicOpen} onToggle={setMusicOpen} openLabel="Takliflar qabuli ochiq" closedLabel="Takliflar qabuli yopiq" />
        </div>
        <p className="panel__hint">Oqshom uchun qo‘shiqlar ro‘yxatini tasdiqlangan takliflardan tuzing.</p>
      </section>

      <MusicList requests={requests} />
    </>
  );
}
