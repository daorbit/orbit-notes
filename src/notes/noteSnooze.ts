import { formatNoteTime, formatSnoozeEnd, formatWeekdayTime } from "./formatNoteDate";

const HOUR_MS = 60 * 60 * 1000;
const MORNING_HOUR = 9;
const MONDAY = 1;
const DAYS_IN_WEEK = 7;

export type SnoozeOption = {
  label: string;
  detail: string;
  until: number;
};

function morningAfter(now: number, days: number): number {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.setHours(MORNING_HOUR, 0, 0, 0);
}

function daysUntilNextMonday(now: number): number {
  return (MONDAY - new Date(now).getDay() + DAYS_IN_WEEK) % DAYS_IN_WEEK || DAYS_IN_WEEK;
}

export function getSnoozeOptions(now: number): SnoozeOption[] {
  const inOneHour = now + HOUR_MS;
  const tomorrow = morningAfter(now, 1);
  const nextWeek = morningAfter(now, daysUntilNextMonday(now));

  return [
    { label: "1 hour", detail: formatNoteTime(inOneHour), until: inOneHour },
    { label: "Tomorrow", detail: formatNoteTime(tomorrow), until: tomorrow },
    { label: "Next week", detail: formatWeekdayTime(nextWeek), until: nextWeek },
  ];
}

export function describeSnooze(until: number, now: number): string {
  return `Snoozed until ${formatSnoozeEnd(until, now)}`;
}
