"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { submitMusicRequest } from "./actions";

export function RequestForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [key, setKey] = useState(0);

  return (
    <form
      key={key}
      className="admin__form"
      action={(formData) =>
        startTransition(async () => {
          const result = await submitMusicRequest(formData);
          if (result.ok) {
            toast({ tone: "success", title: "Taklif yuborildi" });
            setKey((k) => k + 1);
            router.refresh();
          } else {
            toast({ tone: "error", title: "Yuborib bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <div className="admin__row2">
        <Input label="Ijrochi" name="artist" placeholder="Ijrochi nomini kiriting" required disabled={disabled} />
        <Input label="Qo‘shiq" name="song" placeholder="Qo‘shiq nomini kiriting" required disabled={disabled} />
      </div>
      <Button type="submit" loading={pending} disabled={disabled} className="btn--block">
        Taklifni yuborish
      </Button>
    </form>
  );
}
