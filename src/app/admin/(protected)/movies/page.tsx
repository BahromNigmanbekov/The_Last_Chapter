import { listMoviesWithVotes } from "@/lib/admin-data";
import { getEvent } from "@/lib/event";
import { AddMovieForm } from "./AddMovieForm";
import { MovieList } from "./MovieList";
import { VotingToggle } from "./VotingToggle";

export const metadata = { title: "Filmlar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminMoviesPage() {
  const [movies, event] = await Promise.all([listMoviesWithVotes(), getEvent()]);
  const sorted = [...movies].sort((a, b) => b.votes - a.votes);

  return (
    <>
      <h1 className="admin__title">Filmlar</h1>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Ovoz berish</h2>
          <VotingToggle open={event.votingOpen} />
        </div>
        <p className="panel__hint">
          O‘quvchilar faqat ovoz berish ochiq paytda ovoz bera oladi. Natijalarni ko‘rib,
          yakuniy filmni o‘zingiz tasdiqlang. Film avtomatik tanlanmaydi.
        </p>
      </section>

      <AddMovieForm />
      <MovieList movies={sorted} />
    </>
  );
}
