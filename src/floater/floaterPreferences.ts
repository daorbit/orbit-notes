const PREFERENCES_KEY = "floaterPreferences";

export const FLOATER_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

export type FloaterCorner = (typeof FLOATER_CORNERS)[number];

export type FloaterPreferences = {
  isEnabled: boolean;
  isMinimized: boolean;
  corner: FloaterCorner;
  hiddenSites: string[];
};

const DEFAULT_PREFERENCES: FloaterPreferences = {
  isEnabled: true,
  isMinimized: false,
  corner: "bottom-left",
  hiddenSites: [],
};

function parsePreferences(value: unknown): FloaterPreferences {
  if (typeof value !== "object" || value === null) return DEFAULT_PREFERENCES;
  const stored = value as Partial<FloaterPreferences>;
  return {
    isEnabled: stored.isEnabled !== false,
    isMinimized: stored.isMinimized === true,
    corner: FLOATER_CORNERS.find((corner) => corner === stored.corner) ?? DEFAULT_PREFERENCES.corner,
    hiddenSites: Array.isArray(stored.hiddenSites) ? stored.hiddenSites.filter((site) => typeof site === "string") : [],
  };
}

export async function readFloaterPreferences(): Promise<FloaterPreferences> {
  const stored = await chrome.storage.local.get(PREFERENCES_KEY);
  return parsePreferences(stored[PREFERENCES_KEY]);
}

export async function updateFloaterPreferences(change: Partial<FloaterPreferences>): Promise<void> {
  const current = await readFloaterPreferences();
  await chrome.storage.local.set({ [PREFERENCES_KEY]: { ...current, ...change } });
}

export function subscribeToFloaterPreferences(listener: (preferences: FloaterPreferences) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    const change = changes[PREFERENCES_KEY];
    if (area === "local" && change) listener(parsePreferences(change.newValue));
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
