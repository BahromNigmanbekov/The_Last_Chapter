import "server-only";
import { getPublicClient } from "@/lib/supabase/public";
import type { EventInfo, TimelineItem } from "@/types/domain";
import { eventLabel } from "@/lib/labels";

/**
 * Used only if the database is unreachable or not set up yet, so the landing page
 * still renders during local development. The seed file is the source of truth.
 */
const FALLBACK_EVENT: EventInfo = {
  id: "fallback",
  name: "THE LAST CHAPTER",
  subtitle: "2026-YIL BITIRUVCHILARI",
  description: "Ikkita 11-sinf uchun bitiruv oqshomi.",
  location: "Maktabning markaziy hovlisi",
  startsAt: "2027-05-25T20:00:00+05:00",
  endsAt: "2027-05-25T22:00:00+05:00",
  minContribution: 60000,
  registrationOpen: true,
  votingOpen: false,
  musicOpen: false,
  memoriesOpen: false,
  timeline: [
    { time: "20:00", title: "Kutib olish" },
    { time: "20:15", title: "Xotiralar va videolar" },
    { time: "20:30", title: "Film" },
    { time: "21:30", title: "Hikoyalar va tilaklar" },
    { time: "21:45", title: "Yakuniy lahzalar" },
    { time: "22:00", title: "Yakun" },
  ],
};

interface EventRow {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  min_contribution: number;
  registration_open: boolean;
  voting_open: boolean;
  music_open: boolean;
  memories_open: boolean;
  timeline: unknown;
}

function parseTimeline(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && "time" in item && "title" in item) {
      const { time, title } = item as { time: unknown; title: unknown };
      if (typeof time === "string" && typeof title === "string") return [{ time, title }];
    }
    return [];
  });
}

function mapEvent(row: EventRow): EventInfo {
  return {
    id: row.id,
    name: row.name,
    subtitle: eventLabel(row.subtitle),
    description: eventLabel(row.description),
    location: eventLabel(row.location),
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    minContribution: row.min_contribution,
    registrationOpen: row.registration_open,
    votingOpen: row.voting_open,
    musicOpen: row.music_open,
    memoriesOpen: row.memories_open,
    timeline: parseTimeline(row.timeline).map((item) => ({ ...item, title: eventLabel(item.title) })),
  };
}

/** Public event info (readable by anon through RLS). */
export async function getEvent(): Promise<EventInfo> {
  try {
    const { data, error } = await getPublicClient()
      .from("events")
      .select("*")
      .eq("slug", "main")
      .maybeSingle();
    if (error) throw error;
    if (data) return mapEvent(data as EventRow);
    console.warn("[event] No 'main' event row found — run supabase/seed.sql. Using fallback.");
  } catch (err) {
    console.warn("[event] Could not load event, using fallback:", err);
  }
  return FALLBACK_EVENT;
}
