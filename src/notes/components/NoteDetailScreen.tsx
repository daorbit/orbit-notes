import { ScrollArea } from "@mantine/core";
import { CircleCheck, CircleDashed, Flag, FlagOff, Pin, PinOff, Trash2 } from "lucide-react";
import { ActionButton } from "@/ui/ActionButton";
import { BackButton } from "@/ui/BackButton";
import { IconAction } from "@/ui/IconButton";
import { TopBar } from "@/ui/TopBar";
import { useEscapeKey } from "@/ui/useEscapeKey";
import { formatNoteFullDate } from "../formatNoteDate";
import { isDone } from "../noteSelectors";
import type { Note } from "../types";
import type { NoteActions } from "../useNoteActions";
import { NoteStatus } from "./NoteStatus";
import classes from "./noteDetailScreen.module.css";

type NoteDetailScreenProps = {
  note: Note;
  actions: NoteActions;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function NoteDetailScreen({ note, actions, onBack, onEdit, onDelete }: NoteDetailScreenProps) {
  const noteIsDone = isDone(note);
  useEscapeKey(onBack);

  return (
    <div className={classes.screen}>
      <TopBar
        leading={<BackButton label="Notes" onClick={onBack} />}
        actions={
          <>
            <IconAction label={noteIsDone ? "Mark as not done" : "Mark as done"} onClick={() => actions.toggleDone(note)}>
              {noteIsDone ? <CircleDashed size={15} /> : <CircleCheck size={15} />}
            </IconAction>
            {!noteIsDone && (
              <IconAction label={note.important ? "Remove from tabs" : "Mark as important"} onClick={() => actions.toggleImportant(note)}>
                {note.important ? <FlagOff size={15} className={classes.important} /> : <Flag size={15} />}
              </IconAction>
            )}
            <IconAction label={note.pinned ? "Unpin note" : "Pin note"} onClick={() => actions.togglePin(note)}>
              {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
            </IconAction>
            <IconAction label="Delete note" tone="danger" onClick={onDelete}>
              <Trash2 size={15} />
            </IconAction>
            <ActionButton onClick={onEdit}>Edit</ActionButton>
          </>
        }
      />

      <ScrollArea className={classes.scroll} type="hover" scrollbarSize={6}>
        <article className={classes.article}>
          {note.title && (
            <h2 className={`${classes.title} ${noteIsDone ? classes.isDone : ""}`} dir="auto">
              {note.title}
            </h2>
          )}
          <p className={classes.date}>{formatNoteFullDate(note.updatedAt)}</p>
          <NoteStatus note={note} onEndSnooze={() => actions.endSnooze(note)} />
          {note.body && (
            <p className={classes.body} dir="auto">
              {note.body}
            </p>
          )}
        </article>
      </ScrollArea>
    </div>
  );
}
