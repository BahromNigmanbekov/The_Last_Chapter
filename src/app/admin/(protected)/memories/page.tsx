import { listMemories } from "@/lib/admin-data";
import { getEvent } from "@/lib/event";
import { OpenToggle } from "../music/OpenToggle";
import { setMemoriesOpen } from "./actions";
import { MemoryList } from "./MemoryList";

export const metadata = { title: "Xotiralar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminMemoriesPage() {
  const [memories, event] = await Promise.all([listMemories(), getEvent()]);

  return (
    <>
      <h1 className="admin__title">Xotiralar sahifasi</h1>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Xotiralar qabuli</h2>
          <OpenToggle
            open={event.memoriesOpen}
            onToggle={setMemoriesOpen}
            openLabel="Xotiralar qabuli ochiq"
            closedLabel="Xotiralar qabuli yopiq"
          />
        </div>
        <p className="panel__hint">Tadbirda faqat tasdiqlangan xotiralarni ko‘rsating yoki o‘qib bering.</p>
      </section>

      <MemoryList memories={memories} />
    </>
  );
}
