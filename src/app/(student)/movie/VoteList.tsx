"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { voteForMovie } from "./actions";

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  durationMinutes: number | null;
}

export function VoteList({
  movies,
  votedMovieId,
  votingOpen,
}: {
  movies: Movie[];
  votedMovieId: string | null;
  votingOpen: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [voted, setVoted] = useState(votedMovieId);

  if (movies.length === 0) {
    return <p className="panel__empty">Hozircha filmlar qo‘shilmagan. Keyinroq qayta kiring.</p>;
  }

  return (
    <div className="movievote">
      {voted && (
        <p className="notice" style={{ marginBottom: 16 }}>
          Ovozingiz qabul qilindi. Rahmat!
        </p>
      )}
      <div className="movievote__grid">
        {movies.map((movie) => {
          const isMine = voted === movie.id;
          return (
            <article key={movie.id} className={`moviecard ${isMine ? "moviecard--voted" : ""}`}>
              {movie.posterUrl && (
                // Admin-provided poster links; kept as a plain <img> since these are arbitrary external URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={movie.posterUrl} alt="" className="moviecard__poster" />
              )}
              <div className="moviecard__body">
                <h3 className="moviecard__title">{movie.title}</h3>
                {movie.durationMinutes && <p className="moviecard__meta">{movie.durationMinutes} daqiqa</p>}
                {movie.description && <p className="moviecard__desc">{movie.description}</p>}
                <Button
                  className="btn--block"
                  loading={pending}
                  disabled={voted !== null || !votingOpen}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await voteForMovie(movie.id);
                      if (result.ok) {
                        setVoted(movie.id);
                        toast({ tone: "success", title: "Ovozingiz qabul qilindi" });
                        router.refresh();
                      } else {
                        toast({ tone: "error", title: "Ovoz berib bo‘lmadi", description: result.message });
                      }
                    })
                  }
                >
                  {isMine ? "Sizning ovozingiz ✓" : voted ? "Ovoz berilgan" : votingOpen ? "Shu filmga ovoz berish" : "Ovoz berish yopiq"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
