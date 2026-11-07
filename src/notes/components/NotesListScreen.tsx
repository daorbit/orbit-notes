import { ScrollArea } from "@mantine/core";
import { Plus, Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { ActionButton } from "@/ui/ActionButton";
import { EmptyState } from "@/ui/EmptyState";
import { IconAction } from "@/ui/IconButton";
import { ListSection } from "@/ui/ListSection";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { filterNotes, groupNotes, searchNotes } from "../noteSelectors";
import type { Note, NoteFilter } from "../types";
import type { NoteActions } from "../useNoteActions";
import { NoteRow } from "./NoteRow";
import { SearchField } from "./SearchField";
import classes from "./notesListScreen.module.css";

const FILTER_OPTIONS: { value: NoteFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "important", label: "Important" },
  { value: "done", label: "Done" },
];

const EMPTY_FILTERS: Record<NoteFilter, { title: string; message: string }> = {
  all: { title: "All caught up", message: "Every note is done. Write the next one when you’re ready." },
  important: { title: "Nothing important", message: "Mark a note as important and it floats on your tabs until it’s done." },
  done: { title: "Nothing done yet", message: "Notes you mark as done move here." },
};

type NotesListScreenProps = {
  notes: Note[];
  query: string;
  filter: NoteFilter;
  focusNoteId: string | null;
  isHidden: boolean;
  actions: NoteActions;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: NoteFilter) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenSettings: () => void;
};

export function NotesListScreen({
  notes,
  query,
  filter,
  focusNoteId,
  isHidden,
  actions,
  onQueryChange,
  onFilterChange,
  onCreate,
  onOpen,
  onEdit,
  onOpenSettings,
}: NotesListScreenProps) {
  const screen = useRef<HTMLDivElement>(null);
  const hasNotes = notes.some((note) => note.deletedAt === undefined);
  const filteredNotes = filterNotes(notes, filter);
  const groups = groupNotes(searchNotes(filteredNotes, query), Date.now());
  const emptyFilter = EMPTY_FILTERS[filter];

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
          <div className={classes.titleActions}>
            <IconAction label="Settings" onClick={onOpenSettings}>
              <Settings size={16} />
            </IconAction>
            {hasNotes && newNoteButton}
          </div>
        </div>
        {hasNotes && (
          <>
            <SearchField value={query} onChange={onQueryChange} />
            <SegmentedControl label="Show notes" value={filter} options={FILTER_OPTIONS} onChange={onFilterChange} />
          </>
        )}
      </header>

      {!hasNotes ? (
        <EmptyState
          showIcon
          title="No notes yet"
          message="Write something down while you browse. Your notes stay on this device."
          action={newNoteButton}
        />
      ) : filteredNotes.length === 0 ? (
        <EmptyState title={emptyFilter.title} message={emptyFilter.message} />
      ) : groups.length === 0 ? (
        <EmptyState title="No results" message={`No note matches “${query.trim()}”.`} />
      ) : (
        <ScrollArea className={classes.list} type="hover" scrollbarSize={6}>
          {groups.map((group) => (
            <ListSection key={group.label} title={group.label}>
              {group.notes.map((note) => (
                <NoteRow key={note.id} note={note} query={query} showCheck={filter !== "all"} actions={actions} onOpen={onOpen} onEdit={onEdit} />
              ))}
            </ListSection>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
