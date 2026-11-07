import { useEffect, useRef } from "react";
import styles from "./noteEditor.module.css";
import { useNote } from "./useNote";

export function NoteEditor() {
  const { text, saveFailed, updateText } = useNote();
  const editor = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const focusEditorWhenFrameIsFocused = () => {
      if (document.activeElement === document.body) editor.current?.focus();
    };
    window.addEventListener("focus", focusEditorWhenFrameIsFocused);
    return () => window.removeEventListener("focus", focusEditorWhenFrameIsFocused);
  }, []);

  if (text === null) return null;

  return (
    <>
      <textarea
        ref={editor}
        className={styles.editor}
        aria-label="Note"
        dir="auto"
        placeholder="Start writing"
        value={text}
        autoFocus
        onChange={(event) => updateText(event.target.value)}
      />
      {saveFailed && (
        <p className={styles.error} role="status">
          This note isn’t saved. Keep this page open and edit the note to try again.
        </p>
      )}
    </>
  );
}
