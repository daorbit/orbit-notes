import { ScrollArea } from "@mantine/core";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { ActionButton } from "@/ui/ActionButton";
import { EmptyState } from "@/ui/EmptyState";
import { groupNotes, searchNotes } from "../noteSelectors";
import type { Note } from "../types";
import { NoteRow } from "./NoteRow";
import { SearchField } from "./SearchField";
import classes from "./notesListScreen.module.css";

type NotesListScreenProps = {
  notes: Note[];
  query: string;
  focusNoteId: string | null;
  isHidden: boolean;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (note: Note) => void;
};

export function NotesListScreen({
  notes,
  query,
  focusNoteId,
  isHidden,
  onQueryChange,
  onCreate,
  onOpen,
  onEdit,
  onTogglePin,
  onDelete,
}: NotesListScreenProps) {
  const screen = useRef<HTMLDivElement>(null);
  const groups = groupNotes(searchNotes(notes, query), Date.now());

  useEffect(() => {
    if (isHidden || !focusNoteId) return;
    screen.current?.querySelector<HTMLElement>(`[data-note-id="${focusNoteId}"]`)?.focus();
  }, [isHidden, focusNoteId]);

  const newNoteButton = (
    <ActionButton onClick={onCreate}>
      <Plus size={15} strokeWidth={2.4} />
      New note
    </ActionButton>
  );

  return (
    <div ref={screen} className={classes.screen} hidden={isHidden}>
      <header className={classes.header}>
        <div className={classes.titleRow}>
          <h1 className={classes.title}>Notes</h1>
          {notes.length > 0 && newNoteButton}
        </div>
        {notes.length > 0 && <SearchField value={query} onChange={onQueryChange} />}
      </header>

      {notes.length === 0 ? (
        <EmptyState
          showIcon
          title="No notes yet"
          message="Write something down while you browse. Your notes stay on this device."
          action={newNoteButton}
        />
      ) : groups.length === 0 ? (
        <EmptyState title="No results" message={`No note matches “${query.trim()}”.`} />
      ) : (
        <ScrollArea className={classes.list} type="hover" scrollbarSize={6}>
          {groups.map((group) => (
            <section key={group.label} className={classes.section} aria-label={group.label}>
              <h2 className={classes.groupLabel}>{group.label}</h2>
              <div className={classes.group}>
                {group.notes.map((note) => (
                  <NoteRow key={note.id} note={note} query={query} onOpen={onOpen} onEdit={onEdit} onTogglePin={onTogglePin} onDelete={onDelete} />
                ))}
              </div>
            </section>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
