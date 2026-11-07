import { useCallback, useEffect, useRef, useState } from "react";
import { readNote, subscribeToNote, writeNote } from "./noteStorage";

const SAVE_DELAY_MS = 300;

type UseNoteResult = {
  text: string | null;
  saveFailed: boolean;
  updateText: (text: string) => void;
};

export function useNote(): UseNoteResult {
  const [text, setText] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const unsavedText = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(saveTimer.current);
    const pending = unsavedText.current;
    if (pending === null) return;
    unsavedText.current = null;
    writeNote(pending)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, []);

  const updateText = useCallback(
    (next: string) => {
      setText(next);
      unsavedText.current = next;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => {
    readNote().then(setText);
    return subscribeToNote((next) => {
      if (unsavedText.current === null) setText(next);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("blur", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("blur", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return { text, saveFailed, updateText };
}
