import { useEffect } from "react";
import { writeNoteDraft } from "./noteDraftStorage";
import type { NoteDraft } from "./types";

const DRAFT_SAVE_DELAY_MS = 300;

export function useDraftPersistence({ noteId, title, body }: NoteDraft, isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;

    const save = () => void writeNoteDraft({ noteId, title, body });
    const timer = setTimeout(save, DRAFT_SAVE_DELAY_MS);
    window.addEventListener("pagehide", save);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [noteId, title, body, isDirty]);
}
