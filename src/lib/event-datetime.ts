/** datetime-local is always entered as Uzbekistan wall time, independent of server TZ. */
export function parseEventDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+05:00`);
  if (!Number.isFinite(date.getTime())) return null;
  // Reject dates such as February 30 that JavaScript silently rolls forward.
  const wallTime = new Date(date.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
  return wallTime === value ? date : null;
}
