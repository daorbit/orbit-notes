export type NoteValues = {
  title: string;
  body: string;
};

export type Note = NoteValues & {
  id: string;
  pinned: boolean;
  important?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type NoteDraft = NoteValues & {
  noteId: string | null;
};

export type NoteGroup = {
  label: string;
  notes: Note[];
};
