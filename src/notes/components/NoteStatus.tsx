import { CircleCheck, Flag, Link2, MoonStar } from "lucide-react";
import { ActionButton } from "@/ui/ActionButton";
import { formatNoteFullDate } from "../formatNoteDate";
import { describeSnooze } from "../noteSnooze";
import { isDone, isSnoozed } from "../noteSelectors";
import { isWebUrl } from "../noteValidation";
import type { Note } from "../types";
import classes from "./noteStatus.module.css";

type NoteStatusProps = {
  note: Note;
  onEndSnooze: () => void;
};

function NoteState({ note, onEndSnooze }: NoteStatusProps) {
  const now = Date.now();

  if (isDone(note)) {
    return (
      <p className={classes.line}>
        <CircleCheck size={14} className={classes.icon} />
        Done {formatNoteFullDate(note.doneAt as number)}
      </p>
    );
  }

  if (!note.important) return null;

  if (isSnoozed(note, now)) {
    return (
      <div className={classes.line}>
        <MoonStar size={14} className={classes.icon} />
        <span className={classes.text}>{describeSnooze(note.snoozedUntil as number, now)}</span>
        <ActionButton variant="plain" className={classes.action} onClick={onEndSnooze}>
          Show now
        </ActionButton>
      </div>
    );
  }

  return (
    <p className={classes.line}>
      <Flag size={14} className={classes.icon} />
      Showing on your tabs
    </p>
  );
}

export function NoteStatus({ note, onEndSnooze }: NoteStatusProps) {
  const source = note.source && isWebUrl(note.source.url) ? note.source : null;

  return (
    <div className={classes.status}>
      <NoteState note={note} onEndSnooze={onEndSnooze} />
      {source && (
        <a className={classes.source} href={source.url} target="_blank" rel="noreferrer">
          <Link2 size={14} className={classes.icon} />
          <span className={classes.text}>{source.title || new URL(source.url).hostname}</span>
        </a>
      )}
    </div>
  );
}
