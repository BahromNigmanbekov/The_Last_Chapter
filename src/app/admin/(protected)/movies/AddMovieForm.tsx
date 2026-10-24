"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { addMovie } from "./actions";

export function AddMovieForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [key, setKey] = useState(0);

  return (
    <section className="panel">
      <h2 className="panel__title">Film variantini qo‘shish</h2>
      <form
        key={key}
        className="admin__form"
        action={(formData) =>
          startTransition(async () => {
            const result = await addMovie(formData);
            if (result.ok) {
              toast({ tone: "success", title: "Film qo‘shildi" });
              setKey((k) => k + 1);
              router.refresh();
            } else {
              toast({ tone: "error", title: "Filmni qo‘shib bo‘lmadi", description: result.message });
            }
          })
        }
      >
        <Input label="Nomi" name="title" required />
        <div className="admin__row2">
          <Input label="Afisha rasmi havolasi (ixtiyoriy)" name="posterUrl" type="url" placeholder="https://…" />
          <Input label="Davomiyligi, daqiqada (ixtiyoriy)" name="duration" type="number" min={1} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="movie-description">
            Tavsif
          </label>
          <textarea id="movie-description" name="description" className="field__input admin__textarea" rows={3} />
        </div>
        <Button type="submit" loading={pending}>
          Film qo‘shish
        </Button>
      </form>
    </section>
  );
}
