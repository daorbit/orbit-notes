import type { Note } from "./types";

const NOTES_KEY = "notes";

function parseNotes(value: unknown): Note[] {
  return Array.isArray(value) ? (value as Note[]) : [];
}

export async function readNotes(): Promise<Note[]> {
  const stored = await chrome.storage.local.get(NOTES_KEY);
  return parseNotes(stored[NOTES_KEY]);
}

export async function writeNotes(notes: Note[]): Promise<void> {
  await chrome.storage.local.set({ [NOTES_KEY]: notes });
}

export async function removeNoteImportant(id: string): Promise<void> {
  const notes = await readNotes();
  await writeNotes(notes.map((note) => (note.id === id ? { ...note, important: false } : note)));
}

export function subscribeToNotes(listener: (notes: Note[]) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = changes[NOTES_KEY];
    if (area === "local" && change) listener(parseNotes(change.newValue));
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
