import type { Note, NoteFilter, NoteGroup, NoteValues } from "./types";

export const TRASH_RETENTION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const UNTITLED = "Untitled";
const NO_PREVIEW = "No additional text";

function getLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function startOfDay(timestamp: number): number {
  return new Date(timestamp).setHours(0, 0, 0, 0);
}

export function hasContent(values: NoteValues): boolean {
  return values.title.trim() !== "" || values.body.trim() !== "";
}

export function getNoteTitle(note: NoteValues): string {
  return note.title.trim() || getLines(note.body)[0] || UNTITLED;
}

export function getNotePreview(note: NoteValues, query = ""): string {
  const lines = getLines(note.body);
  const term = query.trim().toLowerCase();
  const matchingLine = term ? lines.find((line) => line.toLowerCase().includes(term)) : undefined;
  return matchingLine ?? (note.title.trim() ? lines[0] : lines[1]) ?? NO_PREVIEW;
}

export function getNoteDescription(note: NoteValues): string {
  const lines = getLines(note.body);
  return (note.title.trim() ? lines : lines.slice(1)).join(" ");
}

export function isDone(note: Note): boolean {
  return note.doneAt !== undefined;
}

export function isSnoozed(note: Note, now: number): boolean {
  return note.snoozedUntil !== undefined && note.snoozedUntil > now;
}

export function getFloatingNotes(notes: Note[], now: number): Note[] {
  return notes
    .filter((note) => note.important && !isDone(note) && note.deletedAt === undefined && !isSnoozed(note, now))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNextSnoozeEnd(notes: Note[], now: number): number | null {
  const ends = notes.filter((note) => note.important && !isDone(note) && note.deletedAt === undefined && isSnoozed(note, now)).map((note) => note.snoozedUntil as number);
  return ends.length > 0 ? Math.min(...ends) : null;
}

export function filterNotes(notes: Note[], filter: NoteFilter): Note[] {
  const liveNotes = notes.filter((note) => note.deletedAt === undefined);
  if (filter === "done") return liveNotes.filter(isDone);
  const openNotes = liveNotes.filter((note) => !isDone(note));
  return filter === "important" ? openNotes.filter((note) => note.important) : openNotes;
}

export function getDeletedNotes(notes: Note[]): Note[] {
  return notes.filter((note) => note.deletedAt !== undefined).sort((a, b) => (b.deletedAt as number) - (a.deletedAt as number));
}

export function getDaysUntilPurge(note: Note, now: number): number {
  const remaining = (note.deletedAt as number) + TRASH_RETENTION_DAYS * DAY_MS - now;
  return Math.max(1, Math.ceil(remaining / DAY_MS));
}

export function removeExpiredNotes(notes: Note[], now: number): Note[] {
  const oldestKept = now - TRASH_RETENTION_DAYS * DAY_MS;
  const kept = notes.filter((note) => note.deletedAt === undefined || note.deletedAt > oldestKept);
  return kept.length === notes.length ? notes : kept;
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const term = query.trim().toLowerCase();
  if (!term) return notes;
  return notes.filter((note) => `${note.title}\n${note.body}`.toLowerCase().includes(term));
}

function getGroupLabel(updatedAt: number, now: number): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(updatedAt)) / DAY_MS);
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo <= 7) return "Previous 7 days";
  if (daysAgo <= 30) return "Previous 30 days";
  return "Older";
}

export function groupNotes(notes: Note[], now: number): NoteGroup[] {
  const groups = new Map<string, Note[]>();
  const add = (label: string, note: Note) => groups.set(label, [...(groups.get(label) ?? []), note]);
  const byRecent = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const note of byRecent) {
    if (note.pinned) add("Pinned", note);
  }
  for (const note of byRecent) {
    if (!note.pinned) add(getGroupLabel(note.updatedAt, now), note);
  }

  return [...groups].map(([label, groupedNotes]) => ({ label, notes: groupedNotes }));
}
