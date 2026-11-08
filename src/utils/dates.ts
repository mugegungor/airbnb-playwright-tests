/**
 * Small date helpers so tests never hard-code dates that go stale.
 */

/** Returns a Date `days` days from today (local time, midnight). */
export function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

/** Formats a Date as `YYYY-MM-DD` — the format Airbnb uses in search URLs. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convenience: a check-in / check-out pair starting `offsetDays` from today. */
export function stayDates(offsetDays = 30, nights = 3): { checkin: string; checkout: string } {
  return {
    checkin: toIsoDate(daysFromNow(offsetDays)),
    checkout: toIsoDate(daysFromNow(offsetDays + nights)),
  };
}
