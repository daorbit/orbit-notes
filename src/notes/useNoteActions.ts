import { useMemo } from "react";
import { notify } from "@/shared/notify";
import { isDone } from "./noteSelectors";
import type { NoteStateChange } from "./noteState";
import type { Note } from "./types";

const SAVE_FAILED = "That change isn’t saved. Try again.";

type ChangeNoteState = (id: string, change: NoteStateChange) => Promise<void>;

export function useNoteActions(changeNoteState: ChangeNoteState) {
  return useMemo(() => {
    const change = (note: Note, state: NoteStateChange, onSuccess?: () => void) =>
      changeNoteState(note.id, state).then(onSuccess).catch(() => notify.error(SAVE_FAILED));

    const changeWithUndo = (note: Note, state: NoteStateChange, undoState: NoteStateChange, message: string) => {
      void change(note, state, () => notify.undoable(message, () => void change(note, undoState)));
    };

    return {
      togglePin: (note: Note) => void change(note, { pinned: !note.pinned }),

      toggleImportant: (note: Note) =>
        void change(note, { important: !note.important, snoozedUntil: null }, () =>
          notify.success(note.important ? "Removed from your tabs" : "Now showing on your tabs"),
        ),

      toggleDone: (note: Note) => {
        if (isDone(note)) {
          void change(note, { doneAt: null }, () => notify.success("Marked as not done"));
          return;
        }
        changeWithUndo(note, { doneAt: Date.now(), snoozedUntil: null }, { doneAt: null, snoozedUntil: note.snoozedUntil ?? null }, "Marked as done");
      },

      endSnooze: (note: Note) => void change(note, { snoozedUntil: null }, () => notify.success("Now showing on your tabs")),

      moveToTrash: (note: Note) => changeWithUndo(note, { deletedAt: Date.now() }, { deletedAt: null }, "Moved to Recently deleted"),

      restore: (note: Note) => void change(note, { deletedAt: null }, () => notify.success("Note restored")),
    };
  }, [changeNoteState]);
}

export type NoteActions = ReturnType<typeof useNoteActions>;
