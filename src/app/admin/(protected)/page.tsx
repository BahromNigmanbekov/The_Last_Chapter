import Link from "next/link";
import { getDashboardStats, listMoviesWithVotes, listMusicRequests, listMemories } from "@/lib/admin-data";

export const metadata = { title: "Boshqaruv paneli — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, movies, music, memories] = await Promise.all([
    getDashboardStats(),
    listMoviesWithVotes(),
    listMusicRequests(),
    listMemories(),
  ]);

  const pendingMusic = music.filter((m) => m.status === "pending").length;
  const pendingMemories = memories.filter((m) => m.status === "pending").length;
  const topMovies = [...movies].sort((a, b) => b.votes - a.votes);

  return (
    <>
      <h1 className="admin__title">Boshqaruv paneli</h1>

      <div className="statgrid">
        <div className="statcard">
          <span className="statcard__value">{stats.totalStudents}</span>
          <span className="statcard__label">O‘quvchilar</span>
        </div>
        <div className="statcard">
          <span className="statcard__value">{stats.registered}</span>
          <span className="statcard__label">Ro‘yxatdan o‘tgan</span>
        </div>
        <div className="statcard statcard--ok">
          <span className="statcard__value">{stats.paid}</span>
          <span className="statcard__label">To‘langan</span>
        </div>
        <div className="statcard statcard--warn">
          <span className="statcard__value">{stats.notPaid}</span>
          <span className="statcard__label">To‘lanmagan</span>
        </div>
        <div className="statcard">
          <span className="statcard__value">{stats.entered}</span>
          <span className="statcard__label">Kirgan</span>
        </div>
        <div className="statcard statcard--wide">
          <span className="statcard__value">{stats.totalCollected.toLocaleString("uz-UZ")} so‘m</span>
          <span className="statcard__label">Jami yig‘ilgan badallar</span>
        </div>
      </div>

      <div className="admin__grid2">
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Film uchun ovoz berish</h2>
            <Link href="/admin/movies" className="linkbtn">
              Boshqarish
            </Link>
          </div>
          {topMovies.length === 0 ? (
            <p className="panel__empty">Hozircha filmlar qo‘shilmagan.</p>
          ) : (
            <ul className="barlist">
              {topMovies.map((movie) => {
                const max = Math.max(1, topMovies[0]?.votes ?? 1);
                return (
                  <li key={movie.id} className="barlist__row">
                    <span className="barlist__label">
                      {movie.title} {movie.isSelected && <span className="chip chip--ok">Yakuniy</span>}
                    </span>
                    <div className="barlist__track">
                      <div className="barlist__fill" style={{ width: `${(movie.votes / max) * 100}%` }} />
                    </div>
                    <span className="barlist__value">{movie.votes}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Ko‘rib chiqish kerak</h2>
          </div>
          <ul className="reviewlist">
            <li>
              <Link href="/admin/music" className="reviewlist__row">
                <span>Kutilayotgan qo‘shiq takliflari</span>
                <span className="chip">{pendingMusic}</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/memories" className="reviewlist__row">
                <span>Kutilayotgan xotiralar</span>
                <span className="chip">{pendingMemories}</span>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
