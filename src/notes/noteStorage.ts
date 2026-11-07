const NOTE_KEY = "note";

export async function readNote(): Promise<string> {
  const stored = await chrome.storage.local.get(NOTE_KEY);
  const note = stored[NOTE_KEY];
  return typeof note === "string" ? note : "";
}

export async function writeNote(text: string): Promise<void> {
  await chrome.storage.local.set({ [NOTE_KEY]: text });
}

export function subscribeToNote(listener: (text: string) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = changes[NOTE_KEY];
    if (area === "local" && change) listener(typeof change.newValue === "string" ? change.newValue : "");
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
