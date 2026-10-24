"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { MovieWithVotes } from "@/lib/admin-data";
import { deleteMovie, selectMovie, clearMovieSelection, updateMovie } from "./actions";

function MovieRow({ movie, maxVotes }: { movie: MovieWithVotes; maxVotes: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, successTitle: string) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast({ tone: "success", title: successTitle });
        router.refresh();
      } else {
        toast({ tone: "error", title: "Xatolik yuz berdi", description: result.message });
      }
    });

  if (editing) {
    return (
      <li className="movierow">
        <form
          className="admin__form"
          action={(formData) =>
            startTransition(async () => {
              const result = await updateMovie(movie.id, formData);
              if (result.ok) {
                toast({ tone: "success", title: "Saqlandi" });
                setEditing(false);
                router.refresh();
              } else {
                toast({ tone: "error", title: "Saqlab bo‘lmadi", description: result.message });
              }
            })
          }
        >
          <Input label="Nomi" name="title" defaultValue={movie.title} required />
          <div className="admin__row2">
            <Input label="Afisha havolasi" name="posterUrl" type="url" defaultValue={movie.posterUrl ?? ""} />
            <Input label="Davomiyligi (daqiqa)" name="duration" type="number" min={1} defaultValue={movie.durationMinutes ?? ""} />
          </div>
          <textarea
            name="description"
            className="field__input admin__textarea"
            rows={3}
            defaultValue={movie.description}
          />
          <div className="admin__actions">
            <Button type="submit" loading={pending}>
              Saqlash
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="movierow">
      <div className="movierow__main">
        <div>
          <p className="movierow__title">
            {movie.title} {movie.isSelected && <span className="chip chip--ok">Yakuniy tanlov</span>}
          </p>
          {movie.description && <p className="movierow__desc">{movie.description}</p>}
          {movie.durationMinutes && <p className="movierow__meta">{movie.durationMinutes} daqiqa</p>}
        </div>
        <div className="barlist__track" style={{ width: 140 }}>
          <div className="barlist__fill" style={{ width: `${(movie.votes / maxVotes) * 100}%` }} />
        </div>
        <span className="movierow__votes">{movie.votes} ta ovoz</span>
      </div>
      <div className="admin__actions">
        <Button variant="ghost" onClick={() => setEditing(true)}>
          Tahrirlash
        </Button>
        {movie.isSelected ? (
          <Button variant="ghost" loading={pending} onClick={() => run(clearMovieSelection, "Tanlov bekor qilindi")}>
            Tanlovni bekor qilish
          </Button>
        ) : (
          <Button variant="ghost" loading={pending} onClick={() => run(() => selectMovie(movie.id), "Yakuniy film tasdiqlandi")}>
            Yakuniy film sifatida tasdiqlash
          </Button>
        )}
        <Button
          variant="ghost"
          loading={pending}
          onClick={() => {
            if (!window.confirm(`«${movie.title}» filmi o‘chirilsinmi? Unga berilgan ovozlar ham o‘chiriladi.`)) return;
            run(() => deleteMovie(movie.id), "Film o‘chirildi");
          }}
        >
          O‘chirish
        </Button>
      </div>
    </li>
  );
}

export function MovieList({ movies }: { movies: MovieWithVotes[] }) {
  const maxVotes = Math.max(1, ...movies.map((m) => m.votes));

  return (
    <section className="panel">
      <h2 className="panel__title">
        Barcha filmlar <span className="panel__count">{movies.length}</span>
      </h2>
      {movies.length === 0 ? (
        <p className="panel__empty">Hozircha filmlar qo‘shilmagan.</p>
      ) : (
        <ul className="movielist">
          {movies.map((movie) => (
            <MovieRow key={movie.id} movie={movie} maxVotes={maxVotes} />
          ))}
        </ul>
      )}
    </section>
  );
}
