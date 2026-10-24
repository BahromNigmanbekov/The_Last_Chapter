import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import { VoteList } from "./VoteList";

export const metadata = { title: "Filmga ovoz berish — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

interface MovieRow {
  id: string;
  title: string;
  description: string;
  poster_url: string | null;
  duration_minutes: number | null;
}

export default async function MoviePage() {
  const student = await requireStudent();
  const event = await getEvent();

  const [{ data: movies, error: moviesError }, { data: myVote, error: voteError }] = await Promise.all([
    getAdminClient().from("movies").select("id, title, description, poster_url, duration_minutes").order("created_at"),
    getAdminClient().from("movie_votes").select("movie_id").eq("student_id", student.id).maybeSingle(),
  ]);
  if (moviesError) throw moviesError;
  if (voteError) throw voteError;

  return (
    <>
      <h1 className="auth__title" style={{ marginTop: 12 }}>
        Oqshomimiz uchun film tanlang.
      </h1>
      {!event.votingOpen && !myVote && (
        <p className="notice" style={{ marginTop: 16 }}>
          Hozircha ovoz berish ochilmagan. Keyinroq qayta kiring.
        </p>
      )}
      <VoteList
        movies={(movies as MovieRow[]).map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          posterUrl: m.poster_url,
          durationMinutes: m.duration_minutes,
        }))}
        votedMovieId={(myVote as { movie_id: string } | null)?.movie_id ?? null}
        votingOpen={event.votingOpen}
      />
    </>
  );
}
