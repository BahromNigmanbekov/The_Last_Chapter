"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function OpenToggle({
  open,
  onToggle,
  openLabel,
  closedLabel,
}: {
  open: boolean;
  onToggle: (open: boolean) => Promise<{ ok: boolean; message?: string }>;
  openLabel: string;
  closedLabel: string;
}) {
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
          const result = await onToggle(!open);
          if (result.ok) {
            toast({ title: open ? closedLabel : openLabel });
            router.refresh();
          } else {
            toast({ tone: "error", title: "Yangilab bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <span className="chip__dot" aria-hidden="true" />
      {open ? openLabel : closedLabel}
    </button>
  );
}
