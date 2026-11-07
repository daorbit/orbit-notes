import type { Note, NoteSource } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalTime(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function isWebUrl(url: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function sanitizeSource(value: unknown): NoteSource | undefined {
  if (!isRecord(value) || typeof value.url !== "string" || !isWebUrl(value.url)) return undefined;
  return { url: value.url, title: typeof value.title === "string" ? value.title : "" };
}

export function sanitizeNote(value: unknown): Note | null {
  if (!isRecord(value)) return null;
  const { id, title, body } = value;
  const createdAt = optionalTime(value.createdAt);
  const updatedAt = optionalTime(value.updatedAt);
  if (typeof id !== "string" || !id || typeof title !== "string" || typeof body !== "string") return null;
  if (createdAt === undefined || updatedAt === undefined) return null;

  const doneAt = optionalTime(value.doneAt);
  const snoozedUntil = optionalTime(value.snoozedUntil);
  const deletedAt = optionalTime(value.deletedAt);
  const source = sanitizeSource(value.source);

  return {
    id,
    title,
    body,
    pinned: value.pinned === true,
    createdAt,
    updatedAt,
    ...(value.important === true && { important: true }),
    ...(doneAt !== undefined && { doneAt }),
    ...(snoozedUntil !== undefined && { snoozedUntil }),
    ...(deletedAt !== undefined && { deletedAt }),
    ...(source && { source }),
  };
}

export function sanitizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeNote).filter((note): note is Note => note !== null);
}
