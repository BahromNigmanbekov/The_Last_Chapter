"use client";

import { statusLabel } from "@/lib/labels";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { MusicRequestRow } from "@/lib/admin-data";
import { setMusicRequestStatus } from "./actions";

type Filter = "all" | "pending" | "approved" | "rejected";

export function MusicList({ requests }: { requests: MusicRequestRow[] }) {
  const [filter, setFilter] = useState<Filter>("pending");
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  const act = (id: string, status: "approved" | "rejected" | "pending") =>
    startTransition(async () => {
      const result = await setMusicRequestStatus(id, status);
      if (result.ok) {
        toast({ tone: "success", title: `${statusLabel(status)}` });
        router.refresh();
      } else {
        toast({ tone: "error", title: "Yangilab bo‘lmadi", description: result.message });
      }
    });

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          Requests <span className="panel__count">{filtered.length}</span>
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
          {filtered.map((r) => (
            <li key={r.id} className="reqlist__row">
              <div>
                <p className="reqlist__title">
                  {r.song} — {r.artist}
                </p>
                <p className="reqlist__meta">
                  {r.student ? `${r.student.firstName} ${r.student.lastName} · ${r.student.className}` : "Noma’lum o‘quvchi"}
                </p>
              </div>
              <div className="admin__actions">
                {r.status !== "approved" && (
                  <Button variant="ghost" loading={pending} onClick={() => act(r.id, "approved")}>
                    Tasdiqlash
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button variant="ghost" loading={pending} onClick={() => act(r.id, "rejected")}>
                    Rad etish
                  </Button>
                )}
                <span className={`chip ${r.status === "approved" ? "chip--ok" : ""}`}>{statusLabel(r.status)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
