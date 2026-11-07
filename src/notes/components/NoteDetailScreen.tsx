import { ScrollArea } from "@mantine/core";
import { ChevronLeft, Pin, PinOff, Trash2 } from "lucide-react";
import { ActionButton } from "@/ui/ActionButton";
import { IconAction } from "@/ui/IconButton";
import { TopBar } from "@/ui/TopBar";
import { useEscapeKey } from "@/ui/useEscapeKey";
import { formatNoteFullDate } from "../formatNoteDate";
import type { Note } from "../types";
import classes from "./noteDetailScreen.module.css";

type NoteDetailScreenProps = {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
};

export function NoteDetailScreen({ note, onBack, onEdit, onTogglePin, onDelete }: NoteDetailScreenProps) {
  useEscapeKey(onBack);

  return (
    <div className={classes.screen}>
      <TopBar
        leading={
          <ActionButton variant="plain" className={classes.back} onClick={onBack}>
            <ChevronLeft size={17} />
            Notes
          </ActionButton>
        }
        actions={
          <>
            <IconAction label={note.pinned ? "Unpin note" : "Pin note"} onClick={onTogglePin}>
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
            <h2 className={classes.title} dir="auto">
              {note.title}
            </h2>
          )}
          <p className={classes.date}>{formatNoteFullDate(note.updatedAt)}</p>
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
