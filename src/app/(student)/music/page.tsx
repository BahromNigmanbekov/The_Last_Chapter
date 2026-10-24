import { statusLabel } from "@/lib/labels";
import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import { RequestForm } from "./RequestForm";

export const metadata = { title: "Qo‘shiq taklif qilish — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

interface RequestRow {
  id: string;
  artist: string;
  song: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default async function MusicPage() {
  const student = await requireStudent();
  const event = await getEvent();

  const { data, error } = await getAdminClient()
    .from("music_requests")
    .select("id, artist, song, status, created_at")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const requests = data as RequestRow[];

  return (
    <>
      <h1 className="auth__title" style={{ marginTop: 12 }}>
        Sevimli qo‘shig‘ingizni taklif qiling.
      </h1>

      {!event.musicOpen && (
        <p className="notice" style={{ marginTop: 16 }}>
          Hozircha qo‘shiq takliflari qabul qilinmayapti. Keyinroq qayta kiring.
        </p>
      )}

      <section className="panel" style={{ marginTop: 20 }}>
        <RequestForm disabled={!event.musicOpen} />
      </section>

      <section className="panel">
        <h2 className="panel__title">Sizning takliflaringiz</h2>
        {requests.length === 0 ? (
          <p className="panel__empty">Siz hali qo‘shiq taklif qilmagansiz.</p>
        ) : (
          <ul className="reqlist">
            {requests.map((r) => (
              <li key={r.id} className="reqlist__row">
                <div>
                  <p className="reqlist__title">
                    {r.song} — {r.artist}
                  </p>
                </div>
                <span className={`chip ${r.status === "approved" ? "chip--ok" : ""}`}>{statusLabel(r.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
