import { sanitizeNotes } from "./noteValidation";
import type { Note } from "./types";

const BACKUP_APP = "orbit-notes";
const BACKUP_VERSION = 1;

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export type BackupMerge = {
  notes: Note[];
  added: number;
  updated: number;
};

export function createBackup(notes: Note[], now: number): string {
  return JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now, notes }, null, 2);
}

export function getBackupFileName(now: number): string {
  return `orbit-notes-${new Date(now).toISOString().slice(0, 10)}.json`;
}

export function parseBackup(text: string): Note[] | null {
  try {
    const backup: unknown = JSON.parse(text);
    if (typeof backup !== "object" || backup === null) return null;
    const { app, notes } = backup as { app?: unknown; notes?: unknown };
    return app === BACKUP_APP && Array.isArray(notes) ? sanitizeNotes(notes) : null;
  } catch {
    return null;
  }
}

export function mergeBackup(current: Note[], incoming: Note[]): BackupMerge {
  const merged = new Map(current.map((note) => [note.id, note]));
  let added = 0;
  let updated = 0;

  for (const note of incoming) {
    const existing = merged.get(note.id);
    if (!existing) added += 1;
    else if (note.updatedAt > existing.updatedAt) updated += 1;
    else continue;
    merged.set(note.id, note);
  }

  return { notes: [...merged.values()], added, updated };
}
