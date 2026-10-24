"use client";

import { useEffect, useState } from "react";
import { getEventPhase, splitDuration } from "@/lib/event-phase";
import styles from "./Countdown.module.css";

interface CountdownProps {
  /** ISO timestamps from the events table. */
  startsAt: string;
  endsAt: string;
  /** Server time at render, so a wrong phone clock does not shift the countdown. */
  serverNow: string;
  variant?: "full" | "compact";
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ startsAt, endsAt, serverNow, variant = "full" }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [serverNow]);

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const rootClass = `${styles.root} ${variant === "compact" ? styles.compact : ""}`;

  // Before hydration we don't know the time yet: render the frame with placeholders (no mismatch).
  const phase = now === null ? "before" : getEventPhase(start, end, now);

  if (phase === "started" || phase === "live" || phase === "after") {
    const copy = {
      started: { title: "OQSHOM BOSHLANDI 🎉", text: "THE LAST CHAPTER oqshomiga xush kelibsiz." },
      live: { title: "THE LAST CHAPTER OQSHOMIGA XUSH KELIBSIZ", text: "Har bir lahzadan zavqlaning." },
      after: { title: "BIZ BILAN BO‘LGANINGIZ UCHUN RAHMAT.", text: "Unutilmas oqshom. Yana bir go‘zal xotira." },
    }[phase];
    return (
      <div className={rootClass}>
        <div className={styles.state} role="status">
          <p className={styles.stateTitle}>{copy.title}</p>
          <p className={styles.stateText}>{copy.text}</p>
        </div>
      </div>
    );
  }

  const parts = now === null ? null : splitDuration(start - now);
  const units = [
    { key: "days", label: "Kun", value: parts ? pad(parts.days) : "--" },
    { key: "hours", label: "Soat", value: parts ? pad(parts.hours) : "--" },
    { key: "minutes", label: "Daqiqa", value: parts ? pad(parts.minutes) : "--" },
    { key: "seconds", label: "Soniya", value: parts ? pad(parts.seconds) : "--" },
  ];

  return (
    <div className={rootClass}>
      <div
        className={styles.grid}
        role="timer"
        aria-label={parts ? `${parts.days} kun, ${parts.hours} soat, ${parts.minutes} daqiqa qoldi` : "Tadbirgacha qolgan vaqt"}
      >
        {units.map((unit) => (
          <div key={unit.key} className={`${styles.unit} ${unit.key === "seconds" ? styles.seconds : ""}`}>
            <span key={unit.value} className={`${styles.value} ${unit.key === "seconds" ? styles.tick : ""}`}>
              {unit.value}
            </span>
            <span className={styles.label}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
