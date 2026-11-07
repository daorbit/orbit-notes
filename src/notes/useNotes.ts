import { useCallback, useEffect, useState } from "react";
import { mergeBackup, type BackupMerge } from "./noteBackup";
import { removeExpiredNotes } from "./noteSelectors";
import { applyNoteState, type NoteStateChange } from "./noteState";
import { readNotes, subscribeToNotes, updateNoteState, updateNotes } from "./noteStorage";
import type { Note, NoteSource, NoteValues } from "./types";

function cleanValues({ title, body }: NoteValues): NoteValues {
  return { title: title.trim(), body: body.trimEnd() };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    updateNotes((current) => removeExpiredNotes(current, Date.now()))
      .catch(readNotes)
      .then(setNotes)
      .catch(() => setLoadFailed(true));
    return subscribeToNotes(setNotes);
  }, []);

  const saveNote = useCallback(async (id: string | null, values: NoteValues, source?: NoteSource): Promise<Note> => {
    const now = Date.now();
    const noteId = id ?? crypto.randomUUID();
    const cleaned = cleanValues(values);

    const next = await updateNotes((current) => {
      if (current.some((note) => note.id === noteId)) {
        return current.map((note) => (note.id === noteId ? applyNoteState({ ...note, ...cleaned, updatedAt: now }, { deletedAt: null }) : note));
      }
      return [{ id: noteId, ...cleaned, pinned: false, ...(source && { source }), createdAt: now, updatedAt: now }, ...current];
    });

    setNotes(next);
    return next.find((note) => note.id === noteId) as Note;
  }, []);

  const changeNoteState = useCallback(async (id: string, change: NoteStateChange) => {
    setNotes(await updateNoteState(id, change));
  }, []);

  const deleteForever = useCallback(async (ids: string[]) => {
    const removed = new Set(ids);
    setNotes(await updateNotes((current) => current.filter((note) => !removed.has(note.id))));
  }, []);

  const importNotes = useCallback(async (incoming: Note[]): Promise<BackupMerge> => {
    let merge: BackupMerge = { notes: [], added: 0, updated: 0 };
    const next = await updateNotes((current) => {
      merge = mergeBackup(current, incoming);
      return merge.notes;
    });
    setNotes(next);
    return merge;
  }, []);

  return { notes, loadFailed, saveNote, changeNoteState, deleteForever, importNotes };
}
