"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { setVotingOpen } from "./actions";

export function VotingToggle({ open }: { open: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`chip ${open ? "chip--ok" : ""}`}
      style={{ cursor: "pointer", border: "1px solid var(--line-strong)" }}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setVotingOpen(!open);
          if (result.ok) {
            toast({ title: open ? "Ovoz berish yopiq" : "Ovoz berish ochildi" });
            router.refresh();
          } else {
            toast({ tone: "error", title: "Yangilab bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <span className="chip__dot" aria-hidden="true" />
      {open ? "Ovoz berish ochiq" : "Ovoz berish yopiq"}
    </button>
  );
}
