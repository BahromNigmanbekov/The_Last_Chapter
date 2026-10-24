/** The event happens in Uzbekistan; show times there regardless of the viewer's device. */
export const EVENT_TIME_ZONE = "Asia/Tashkent";

/** "25 MAY" */
export function formatEventDay(iso: string): string {
  const parts = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: EVENT_TIME_ZONE,
    day: "numeric",
    month: "long",
  }).formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${day}-${month}`.toUpperCase();
}

/** "20:00" (24h) */
export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: EVENT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

/** "20:00 — 22:00" */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatEventTime(startIso)} — ${formatEventTime(endIso)}`;
}

/** "2027-05-25T20:00" for a <input type="datetime-local"> in the event's own time zone. */
export function toDatetimeLocalValue(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
