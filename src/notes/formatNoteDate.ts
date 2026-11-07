const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });
const shortDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" });
const weekdayTimeFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

export function formatNoteTimestamp(timestamp: number, now: number): string {
  if (new Date(timestamp).toDateString() === new Date(now).toDateString()) {
    return timeFormat.format(timestamp);
  }
  return now - timestamp < WEEK_MS ? weekdayFormat.format(timestamp) : shortDateFormat.format(timestamp);
}

export function formatNoteFullDate(timestamp: number): string {
  return fullDateFormat.format(timestamp);
}

export function formatNoteTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

export function formatWeekdayTime(timestamp: number): string {
  return weekdayTimeFormat.format(timestamp);
}

export function formatSnoozeEnd(timestamp: number, now: number): string {
  const date = new Date(timestamp);
  if (date.toDateString() === new Date(now).toDateString()) return timeFormat.format(timestamp);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return `tomorrow, ${timeFormat.format(timestamp)}`;
  return weekdayTimeFormat.format(timestamp);
}
