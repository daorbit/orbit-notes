import { UnstyledButton } from "@mantine/core";
import { Flag } from "lucide-react";
import { formatNoteTimestamp } from "../formatNoteDate";
import { getNotePreview, getNoteTitle } from "../noteSelectors";
import type { Note } from "../types";
import { HighlightedText } from "./HighlightedText";
import { NoteRowMenu } from "./NoteRowMenu";
import classes from "./noteRow.module.css";

type NoteRowProps = {
  note: Note;
  query: string;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleImportant: (note: Note) => void;
  onDelete: (note: Note) => void;
};

export function NoteRow({ note, query, onOpen, onEdit, onTogglePin, onToggleImportant, onDelete }: NoteRowProps) {
  const title = getNoteTitle(note);

  return (
    <div className={classes.row} data-note-row>
      <UnstyledButton className={classes.open} data-note-id={note.id} onClick={() => onOpen(note.id)}>
        <span className={classes.titleLine}>
          {note.important && <Flag size={12} className={classes.flag} aria-label="Important" />}
          <span className={classes.title}>
            <HighlightedText text={title} query={query} />
          </span>
        </span>
        <span className={classes.details}>
          <span className={classes.time}>{formatNoteTimestamp(note.updatedAt, Date.now())}</span>
          <span className={classes.preview}>
            <HighlightedText text={getNotePreview(note, query)} query={query} />
          </span>
        </span>
      </UnstyledButton>
      <div className={classes.menu}>
        <NoteRowMenu
          title={title}
          isPinned={note.pinned}
          isImportant={Boolean(note.important)}
          onEdit={() => onEdit(note.id)}
          onTogglePin={() => onTogglePin(note.id)}
          onToggleImportant={() => onToggleImportant(note)}
          onDelete={() => onDelete(note)}
        />
      </div>
    </div>
  );
}
