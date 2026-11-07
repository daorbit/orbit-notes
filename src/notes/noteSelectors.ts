import type { Note, NoteGroup, NoteValues } from "./types";

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

export function getImportantNotes(notes: Note[]): Note[] {
  return notes.filter((note) => note.important).sort((a, b) => b.updatedAt - a.updatedAt);
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
