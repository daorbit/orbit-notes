import { useEffect } from "react";
import { subscribeToNoteOpenRequests, takeNoteOpenRequest } from "./noteOpenRequest";

export function useNoteOpenRequests(onOpen: (noteId: string) => void): void {
  useEffect(() => {
    const openPendingNote = () => {
      takeNoteOpenRequest()
        .then((noteId) => {
          if (noteId) onOpen(noteId);
        })
        .catch(console.error);
    };
    openPendingNote();
    return subscribeToNoteOpenRequests(openPendingNote);
  }, [onOpen]);
}
