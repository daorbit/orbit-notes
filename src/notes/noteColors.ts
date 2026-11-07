import type { Note, NoteColor } from "./types";

export const NOTE_COLORS: { value: NoteColor; label: string }[] = [
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "violet", label: "Violet" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
];

const DEFAULT_NOTE_COLOR: NoteColor = "amber";

export function getNoteColor(note: Note): NoteColor {
  return note.color ?? DEFAULT_NOTE_COLOR;
}

export function isNoteColor(value: unknown): value is NoteColor {
  return NOTE_COLORS.some((color) => color.value === value);
}
