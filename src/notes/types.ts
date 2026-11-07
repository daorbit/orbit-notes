export type NoteValues = {
  title: string;
  body: string;
};

export type NoteSource = {
  url: string;
  title: string;
};

export type NoteColor = "amber" | "rose" | "violet" | "blue" | "green";

export type Note = NoteValues & {
  id: string;
  pinned: boolean;
  important?: boolean;
  color?: NoteColor;
  doneAt?: number;
  snoozedUntil?: number;
  deletedAt?: number;
  source?: NoteSource;
  createdAt: number;
  updatedAt: number;
};

export type NoteDraft = NoteValues & {
  noteId: string | null;
  source?: NoteSource;
};

export type NoteGroup = {
  label: string;
  notes: Note[];
};

export type NoteFilter = "all" | "important" | "done";
