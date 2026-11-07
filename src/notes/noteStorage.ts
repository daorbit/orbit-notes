import { applyNoteState, type NoteStateChange } from "./noteState";
import { sanitizeNotes } from "./noteValidation";
import type { Note } from "./types";

const NOTES_KEY = "notes";
const NOTES_LOCK = "orbit-notes:notes";

export async function readNotes(): Promise<Note[]> {
  const stored = await chrome.storage.local.get(NOTES_KEY);
  return sanitizeNotes(stored[NOTES_KEY]);
}

export function updateNotes(change: (notes: Note[]) => Note[]): Promise<Note[]> {
  return navigator.locks.request(NOTES_LOCK, async () => {
    const notes = await readNotes();
    const next = change(notes);
    if (next !== notes) await chrome.storage.local.set({ [NOTES_KEY]: next });
    return next;
  });
}

export function updateNoteState(id: string, change: NoteStateChange): Promise<Note[]> {
  return updateNotes((notes) => notes.map((note) => (note.id === id ? applyNoteState(note, change) : note)));
}

export function subscribeToNotes(listener: (notes: Note[]) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = changes[NOTES_KEY];
    if (area === "local" && change) listener(sanitizeNotes(change.newValue));
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
