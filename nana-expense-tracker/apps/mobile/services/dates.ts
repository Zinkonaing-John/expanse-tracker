/**
 * Local-timezone date helpers.
 *
 * The app stores expense dates as YYYY-MM-DD strings. Using
 * `new Date().toISOString()` would produce the UTC date, which is wrong for
 * users behind UTC (an expense added at 8pm in New York would land on
 * "tomorrow"). These helpers always use the device's local calendar.
 */

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayString(): string {
  return toLocalDateString(new Date());
}

/** Start of the current week (Sunday-based), as YYYY-MM-DD. */
export function weekStartString(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return toLocalDateString(start);
}

/** First day of the current month, as YYYY-MM-DD. */
export function monthStartString(): string {
  const now = new Date();
  return toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
}
