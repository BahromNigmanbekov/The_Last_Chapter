"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { importStudents } from "./actions";

export function ImportForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [key, setKey] = useState(0);

  return (
    <section className="panel">
      <h2 className="panel__title">Ro‘yxatni ommaviy kiritish</h2>
      <p className="panel__hint">
        Har bir qatorda bitta o‘quvchi: <code>Ism,Familiya,Sinf</code>. Jadvaldan nusxalangan ro‘yxatni shu yerga joylang.
      </p>
      <form
        key={key}
        className="admin__form"
        action={(formData) =>
          startTransition(async () => {
            const result = await importStudents(formData);
            if (result.ok) {
              toast({ tone: "success", title: "Ro‘yxat kiritildi", description: result.message });
              setKey((k) => k + 1);
              router.refresh();
            } else {
              toast({ tone: "error", title: "Ro‘yxatni kiritib bo‘lmadi", description: result.message });
            }
          })
        }
      >
        <textarea
          name="csv"
          className="field__input admin__textarea"
          placeholder={"Aziz,Karimov,11-A\nMalika,Yusupova,11-A"}
          rows={5}
          required
        />
        <Button type="submit" loading={pending}>
          O‘quvchilarni kiritish
        </Button>
      </form>
    </section>
  );
}
