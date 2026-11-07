import { ScrollArea } from "@mantine/core";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { notify } from "@/shared/notify";
import { ActionButton } from "@/ui/ActionButton";
import { BackButton } from "@/ui/BackButton";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { EmptyState } from "@/ui/EmptyState";
import { IconAction } from "@/ui/IconButton";
import { ListSection } from "@/ui/ListSection";
import { TopBar } from "@/ui/TopBar";
import { useEscapeKey } from "@/ui/useEscapeKey";
import { getDaysUntilPurge, getDeletedNotes, getNotePreview, getNoteTitle, TRASH_RETENTION_DAYS } from "../noteSelectors";
import type { Note } from "../types";
import classes from "./recentlyDeletedScreen.module.css";

type RecentlyDeletedScreenProps = {
  notes: Note[];
  onBack: () => void;
  onRestore: (note: Note) => void;
  onDeleteForever: (ids: string[]) => Promise<void>;
};

function formatDaysLeft(days: number): string {
  return days === 1 ? "1 day left" : `${days} days left`;
}

export function RecentlyDeletedScreen({ notes, onBack, onRestore, onDeleteForever }: RecentlyDeletedScreenProps) {
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletedNotes = getDeletedNotes(notes);
  const now = Date.now();
  const isConfirming = pendingNotes.length > 0;

  useEscapeKey(onBack);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDeleteForever(pendingNotes.map((note) => note.id));
      notify.success(pendingNotes.length === 1 ? "Note deleted" : "Notes deleted");
      setPendingNotes([]);
    } catch {
      notify.error("These notes aren’t deleted. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmTitle = pendingNotes.length === 1 ? "Delete this note forever?" : `Delete ${pendingNotes.length} notes forever?`;
  const confirmMessage =
    pendingNotes.length === 1 ? `“${getNoteTitle(pendingNotes[0])}” will be permanently deleted. This can’t be undone.` : "These notes will be permanently deleted. This can’t be undone.";

  return (
    <div className={classes.screen}>
      <TopBar
        leading={<BackButton label="Settings" onClick={onBack} />}
        actions={
          deletedNotes.length > 0 && (
            <ActionButton variant="plain" className={classes.empty} onClick={() => setPendingNotes(deletedNotes)}>
              Empty
            </ActionButton>
          )
        }
      />
      <h1 className={classes.heading}>Recently deleted</h1>

      {deletedNotes.length === 0 ? (
        <EmptyState title="Nothing here" message={`Deleted notes stay here for ${TRASH_RETENTION_DAYS} days, then they’re removed for good.`} />
      ) : (
        <ScrollArea className={classes.list} type="hover" scrollbarSize={6}>
          <ListSection title={`Removed for good after ${TRASH_RETENTION_DAYS} days`}>
            {deletedNotes.map((note) => {
              const title = getNoteTitle(note);
              return (
                <div key={note.id} className={classes.row} data-deleted-row>
                  <div className={classes.text}>
                    <span className={classes.title}>{title}</span>
                    <span className={classes.details}>
                      {formatDaysLeft(getDaysUntilPurge(note, now))} · {getNotePreview(note)}
                    </span>
                  </div>
                  <IconAction label={`Restore ${title}`} onClick={() => onRestore(note)}>
                    <RotateCcw size={15} />
                  </IconAction>
                  <IconAction label={`Delete ${title} forever`} tone="danger" onClick={() => setPendingNotes([note])}>
                    <Trash2 size={15} />
                  </IconAction>
                </div>
              );
            })}
          </ListSection>
        </ScrollArea>
      )}

      <ConfirmDialog
        opened={isConfirming}
        title={confirmTitle}
        message={isConfirming ? confirmMessage : ""}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        isBusy={isDeleting}
        onCancel={() => setPendingNotes([])}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
