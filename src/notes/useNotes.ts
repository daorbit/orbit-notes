import { useCallback, useEffect, useRef, useState } from "react";
import { readNotes, subscribeToNotes, writeNotes } from "./noteStorage";
import type { Note, NoteValues } from "./types";

function cleanValues({ title, body }: NoteValues): NoteValues {
  return { title: title.trim(), body: body.trimEnd() };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const latestNotes = useRef<Note[]>([]);

  const applyNotes = useCallback((next: Note[]) => {
    latestNotes.current = next;
    setNotes(next);
  }, []);

  useEffect(() => {
    readNotes()
      .then(applyNotes)
      .catch(() => setLoadFailed(true));
    return subscribeToNotes(applyNotes);
  }, [applyNotes]);

  const persist = useCallback(
    async (next: Note[]) => {
      await writeNotes(next);
      applyNotes(next);
    },
    [applyNotes],
  );

  const saveNote = useCallback(
    async (id: string | null, values: NoteValues): Promise<Note> => {
      const now = Date.now();
      const existing = latestNotes.current.find((note) => note.id === id);

      if (existing) {
        const updated: Note = { ...existing, ...cleanValues(values), updatedAt: now };
        await persist(latestNotes.current.map((note) => (note.id === existing.id ? updated : note)));
        return updated;
      }

      const created: Note = { id: crypto.randomUUID(), ...cleanValues(values), pinned: false, createdAt: now, updatedAt: now };
      await persist([created, ...latestNotes.current]);
      return created;
    },
    [persist],
  );

  const togglePin = useCallback(
    (id: string) => persist(latestNotes.current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note))),
    [persist],
  );

  const deleteNote = useCallback(
    (id: string) => persist(latestNotes.current.filter((note) => note.id !== id)),
    [persist],
  );

  return { notes, loadFailed, saveNote, togglePin, deleteNote };
}
