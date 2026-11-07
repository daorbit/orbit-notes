import type { NoteDraft } from "./types";

const DRAFT_KEY = "noteDraft";

export async function readNoteDraft(): Promise<NoteDraft | null> {
  const stored = await chrome.storage.local.get(DRAFT_KEY);
  const draft = stored[DRAFT_KEY] as NoteDraft | undefined;
  return draft && typeof draft.title === "string" && typeof draft.body === "string" ? draft : null;
}

export async function writeNoteDraft(draft: NoteDraft): Promise<void> {
  await chrome.storage.local.set({ [DRAFT_KEY]: draft });
}

export async function clearNoteDraft(): Promise<void> {
  await chrome.storage.local.remove(DRAFT_KEY);
}
