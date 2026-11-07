const REQUEST_KEY = "openNoteRequest";

export async function requestNoteOpen(noteId: string): Promise<void> {
  await chrome.storage.session.set({ [REQUEST_KEY]: noteId });
}

export async function takeNoteOpenRequest(): Promise<string | null> {
  const stored = await chrome.storage.session.get(REQUEST_KEY);
  const noteId = stored[REQUEST_KEY];
  if (typeof noteId !== "string") return null;
  await chrome.storage.session.remove(REQUEST_KEY);
  return noteId;
}

export function subscribeToNoteOpenRequests(listener: () => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "session" && changes[REQUEST_KEY]?.newValue) listener();
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
