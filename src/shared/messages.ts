import type { NoteStateChange } from "@/notes/noteState";

export type FloaterMessage =
  | { type: "open-panel"; noteId: string }
  | { type: "update-note"; noteId: string; change: NoteStateChange };
