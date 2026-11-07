const COLLAPSED_KEY = "floatersCollapsed";

export async function readFloatersCollapsed(): Promise<boolean> {
  const stored = await chrome.storage.local.get(COLLAPSED_KEY);
  return stored[COLLAPSED_KEY] === true;
}

export async function writeFloatersCollapsed(isCollapsed: boolean): Promise<void> {
  await chrome.storage.local.set({ [COLLAPSED_KEY]: isCollapsed });
}

export function subscribeToFloatersCollapsed(listener: (isCollapsed: boolean) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = changes[COLLAPSED_KEY];
    if (area === "local" && change) listener(change.newValue === true);
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
