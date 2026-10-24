"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { EventInfo } from "@/types/domain";
import { toDatetimeLocalValue } from "@/lib/format";
import { updateEventSettings } from "./actions";

export function SettingsForm({ event }: { event: EventInfo }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin__form"
      action={(formData) =>
        startTransition(async () => {
          const result = await updateEventSettings(formData);
          if (result.ok) {
            toast({ tone: "success", title: "Sozlamalar saqlandi" });
            router.refresh();
          } else {
            toast({ tone: "error", title: "Saqlab bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <div className="admin__row2">
        <Input label="Tadbir nomi" name="name" defaultValue={event.name} required />
        <Input label="Qo‘shimcha sarlavha" name="subtitle" defaultValue={event.subtitle} />
      </div>
      <Input label="Manzil" name="location" defaultValue={event.location} required />
      <div className="admin__row2">
        <Input
          label="Boshlanish vaqti"
          name="startsAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(event.startsAt)}
          required
        />
        <Input
          label="Tugash vaqti"
          name="endsAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(event.endsAt)}
          required
        />
      </div>
      <Input
        label="Minimal badal (so‘m)"
        name="minContribution"
        type="number"
        min={1}
        defaultValue={event.minContribution}
        required
      />
      <Button type="submit" loading={pending}>
        Sozlamalarni saqlash
      </Button>
    </form>
  );
}
