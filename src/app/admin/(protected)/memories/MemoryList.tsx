"use client";

import { statusLabel } from "@/lib/labels";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { MemoryRow } from "@/lib/admin-data";
import { MemoryMedia } from "@/components/MemoryMedia";
import { setMemoryStatus, deleteMemory } from "./actions";

type Filter = "all" | "pending" | "approved" | "rejected";

export function MemoryList({ memories }: { memories: MemoryRow[] }) {
  const [filter, setFilter] = useState<Filter>("pending");
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "all" ? memories : memories.filter((m) => m.status === filter)),
    [memories, filter],
  );

  const act = (fn: () => Promise<{ ok: boolean; message?: string }>, title: string) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast({ tone: "success", title });
        router.refresh();
      } else {
        toast({ tone: "error", title: "Yangilab bo‘lmadi", description: result.message });
      }
    });

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          Xotiralar <span className="panel__count">{filtered.length}</span>
        </h2>
        <div className="admin__tabs">
          {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`admin__tab ${filter === f ? "admin__tab--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {statusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="panel__empty">Hozircha ma’lumot yo‘q.</p>
      ) : (
        <ul className="reqlist">
          {filtered.map((m) => (
            <li key={m.id} className="reqlist__row">
              <div>
                <MemoryMedia kind={m.kind} url={m.mediaUrl ?? null} />
                <p className="reqlist__title">{m.caption ?? "Izohsiz fayl"}</p>
                <p className="reqlist__meta">
                  {m.student ? `${m.student.firstName} ${m.student.lastName} · ${m.student.className}` : "Noma’lum o‘quvchi"}
                  {" · "}
                  {statusLabel(m.kind)}
                </p>
              </div>
              <div className="admin__actions">
                {m.status !== "approved" && (
                  <Button variant="ghost" loading={pending} onClick={() => act(() => setMemoryStatus(m.id, "approved"), "Tasdiqlandi")}>
                    Tasdiqlash
                  </Button>
                )}
                {m.status !== "rejected" && (
                  <Button variant="ghost" loading={pending} onClick={() => act(() => setMemoryStatus(m.id, "rejected"), "Rad etildi")}>
                    Rad etish
                  </Button>
                )}
                <Button
                  variant="ghost"
                  loading={pending}
                  onClick={() => {
                    if (!window.confirm("Bu xotira butunlay o‘chirilsinmi?")) return;
                    act(() => deleteMemory(m.id), "O‘chirildi");
                  }}
                >
                  O‘chirish
                </Button>
                <span className={`chip ${m.status === "approved" ? "chip--ok" : ""}`}>{statusLabel(m.status)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
