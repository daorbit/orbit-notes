import type { NoteSource, NoteValues } from "./types";

const REQUEST_KEY = "panelRequest";

export type PanelRequest =
  | { type: "open-note"; noteId: string }
  | { type: "capture"; values: NoteValues; source?: NoteSource };

export async function sendPanelRequest(request: PanelRequest): Promise<void> {
  await chrome.storage.session.set({ [REQUEST_KEY]: request });
}

export async function takePanelRequest(): Promise<PanelRequest | null> {
  const stored = await chrome.storage.session.get(REQUEST_KEY);
  const request = stored[REQUEST_KEY] as PanelRequest | undefined;
  if (!request) return null;
  await chrome.storage.session.remove(REQUEST_KEY);
  return request;
}

export function subscribeToPanelRequests(listener: () => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "session" && changes[REQUEST_KEY]?.newValue) listener();
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
