import type { Note, NoteColor } from "./types";

export type NoteStateChange = {
  pinned?: boolean;
  important?: boolean;
  color?: NoteColor;
  doneAt?: number | null;
  snoozedUntil?: number | null;
  deletedAt?: number | null;
};

export function applyNoteState(note: Note, change: NoteStateChange): Note {
  const merged = Object.entries({ ...note, ...change }).filter(([, value]) => value !== null);
  return Object.fromEntries(merged) as Note;
}
