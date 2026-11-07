import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ActionButton } from "@/ui/ActionButton";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { TopBar } from "@/ui/TopBar";
import { useEscapeKey } from "@/ui/useEscapeKey";
import { hasContent } from "../noteSelectors";
import type { NoteDraft, NoteSource, NoteValues } from "../types";
import { useDraftPersistence } from "../useDraftPersistence";
import classes from "./noteEditorScreen.module.css";

const EMPTY_VALUES: NoteValues = { title: "", body: "" };
const SAVE_SHORTCUT = navigator.userAgent.includes("Mac") ? "⌘ Return to save" : "Ctrl + Enter to save";

export type IncomingText = {
  id: number;
  text: string;
};

type NoteEditorScreenProps = {
  noteId: string | null;
  savedValues?: NoteValues;
  restoredDraft?: NoteDraft;
  incomingText?: IncomingText;
  onSave: (noteId: string | null, values: NoteValues, source?: NoteSource) => Promise<boolean>;
  onCancel: (noteId: string | null) => void;
};

export function NoteEditorScreen({ noteId, savedValues, restoredDraft, incomingText, onSave, onCancel }: NoteEditorScreenProps) {
  const baseline = savedValues ?? EMPTY_VALUES;
  const source = restoredDraft?.source;
  const [title, setTitle] = useState((restoredDraft ?? baseline).title);
  const [body, setBody] = useState((restoredDraft ?? baseline).body);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const titleInput = useRef<HTMLTextAreaElement>(null);
  const bodyInput = useRef<HTMLTextAreaElement>(null);
  const lastIncomingId = useRef<number | null>(null);

  const isDirty = title !== baseline.title || body !== baseline.body;
  const canSave = isDirty && hasContent({ title, body }) && !isSaving;

  useDraftPersistence({ noteId, title, body, source }, isDirty && !isSaving);

  useEffect(() => {
    const field = noteId ? bodyInput.current : titleInput.current;
    field?.focus();
    field?.setSelectionRange(field.value.length, field.value.length);
  }, [noteId]);

  useEffect(() => {
    if (!incomingText || lastIncomingId.current === incomingText.id) return;
    lastIncomingId.current = incomingText.id;
    setBody((current) => (current ? `${current}\n\n${incomingText.text}` : incomingText.text));
  }, [incomingText]);

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    const saved = await onSave(noteId, { title, body }, source);
    if (!saved) setIsSaving(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsDiscardOpen(true);
    } else {
      onCancel(noteId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void handleSave();
    }
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    bodyInput.current?.focus();
  };

  useEscapeKey(handleCancel);

  return (
    <>
      <div className={classes.screen} onKeyDown={handleKeyDown}>
        <TopBar
          leading={
            <ActionButton variant="plain" onClick={handleCancel}>
              Cancel
            </ActionButton>
          }
          title={noteId ? "Edit note" : "New note"}
          actions={
            <ActionButton disabled={!canSave} onClick={() => void handleSave()}>
              Save
            </ActionButton>
          }
        />

        <div className={classes.page}>
          <textarea
            ref={titleInput}
            className={classes.title}
            rows={1}
            aria-label="Title"
            dir="auto"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value.replace(/\n/g, " "))}
            onKeyDown={handleTitleKeyDown}
          />
          {source && <p className={classes.source}>From {source.title || source.url}</p>}
          <textarea
            ref={bodyInput}
            className={classes.body}
            aria-label="Note"
            dir="auto"
            placeholder="Start writing"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        <footer className={classes.footer}>
          <span>{isDirty ? "Unsaved changes" : "No changes"}</span>
          <span>{SAVE_SHORTCUT}</span>
        </footer>
      </div>

      <ConfirmDialog
        opened={isDiscardOpen}
        title="Discard changes?"
        message="Your changes to this note won’t be saved."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => setIsDiscardOpen(false)}
        onConfirm={() => onCancel(noteId)}
      />
    </>
  );
}
