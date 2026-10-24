export type EventPhase = "before" | "started" | "live" | "after";

/** First minutes after the start show the "night has started" moment. */
const STARTED_WINDOW_MS = 15 * 60 * 1000;

/** Pure, isomorphic: derives the phase from real timestamps, nothing is hardcoded. */
export function getEventPhase(startsAt: number, endsAt: number, now: number): EventPhase {
  if (now < startsAt) return "before";
  if (now >= endsAt) return "after";
  return now < startsAt + STARTED_WINDOW_MS ? "started" : "live";
}

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function splitDuration(ms: number): TimeParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
