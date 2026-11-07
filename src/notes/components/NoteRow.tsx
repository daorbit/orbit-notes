import { UnstyledButton } from "@mantine/core";
import { Flag, MoonStar } from "lucide-react";
import { CheckCircle } from "@/ui/CheckCircle";
import { formatNoteTimestamp } from "../formatNoteDate";
import { getNotePreview, getNoteTitle, isDone, isSnoozed } from "../noteSelectors";
import type { Note } from "../types";
import type { NoteActions } from "../useNoteActions";
import { HighlightedText } from "./HighlightedText";
import { NoteRowMenu } from "./NoteRowMenu";
import classes from "./noteRow.module.css";

type NoteRowProps = {
  note: Note;
  query: string;
  showCheck: boolean;
  actions: NoteActions;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
};

function NoteStateIcon({ note, now }: { note: Note; now: number }) {
  if (!note.important || isDone(note)) return null;
  if (isSnoozed(note, now)) return <MoonStar size={12} className={classes.stateIcon} aria-label="Snoozed" />;
  return <Flag size={12} className={`${classes.stateIcon} ${classes.flag}`} aria-label="Important" />;
}

export function NoteRow({ note, query, showCheck, actions, onOpen, onEdit }: NoteRowProps) {
  const title = getNoteTitle(note);
  const now = Date.now();
  const noteIsDone = isDone(note);

  return (
    <div className={`${classes.row} ${noteIsDone ? classes.isDone : ""}`} data-note-row>
      {showCheck && (
        <span className={classes.check}>
          <CheckCircle
            isChecked={noteIsDone}
            label={noteIsDone ? `Mark ${title} as not done` : `Mark ${title} as done`}
            onToggle={() => actions.toggleDone(note)}
          />
        </span>
      )}
      <UnstyledButton className={classes.open} data-note-id={note.id} onClick={() => onOpen(note.id)}>
        <span className={classes.titleLine}>
          <NoteStateIcon note={note} now={now} />
          <span className={classes.title}>
            <HighlightedText text={title} query={query} />
          </span>
        </span>
        <span className={classes.details}>
          <span className={classes.time}>{formatNoteTimestamp(note.doneAt ?? note.updatedAt, now)}</span>
          <span className={classes.preview}>
            <HighlightedText text={getNotePreview(note, query)} query={query} />
          </span>
        </span>
      </UnstyledButton>
      <div className={classes.menu}>
        <NoteRowMenu note={note} title={title} actions={actions} onEdit={() => onEdit(note.id)} />
      </div>
    </div>
  );
}
