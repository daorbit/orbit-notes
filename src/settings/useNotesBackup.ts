import { useCallback } from "react";
import { createBackup, getBackupFileName, MAX_BACKUP_BYTES, parseBackup, type BackupMerge } from "@/notes/noteBackup";
import type { Note } from "@/notes/types";
import { downloadTextFile } from "@/shared/downloadFile";
import { notify } from "@/shared/notify";

const IMPORT_FAILED = "That file isn’t an Orbit Notes backup. Choose another file.";

function describeImport({ added, updated }: BackupMerge): string {
  const changed = added + updated;
  if (changed === 0) return "Your notes are already up to date";
  return changed === 1 ? "1 note imported" : `${changed} notes imported`;
}

export function useNotesBackup(notes: Note[], importNotes: (incoming: Note[]) => Promise<BackupMerge>) {
  const exportNotes = useCallback(() => {
    const now = Date.now();
    downloadTextFile(getBackupFileName(now), createBackup(notes, now), "application/json");
    notify.success(notes.length === 1 ? "1 note exported" : `${notes.length} notes exported`);
  }, [notes]);

  const importFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_BACKUP_BYTES) {
        notify.error(IMPORT_FAILED);
        return;
      }
      const incoming = parseBackup(await file.text());
      if (!incoming) {
        notify.error(IMPORT_FAILED);
        return;
      }
      try {
        notify.success(describeImport(await importNotes(incoming)));
      } catch {
        notify.error("Those notes aren’t imported. Try again.");
      }
    },
    [importNotes],
  );

  return { exportNotes, importFile };
}
