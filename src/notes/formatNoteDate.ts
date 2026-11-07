const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });
const shortDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" });

export function formatNoteTimestamp(timestamp: number, now: number): string {
  if (new Date(timestamp).toDateString() === new Date(now).toDateString()) {
    return timeFormat.format(timestamp);
  }
  return now - timestamp < WEEK_MS ? weekdayFormat.format(timestamp) : shortDateFormat.format(timestamp);
}

export function formatNoteFullDate(timestamp: number): string {
  return fullDateFormat.format(timestamp);
}
