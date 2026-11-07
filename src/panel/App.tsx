import { useEffect, useState } from "react";
import { NoteDetailScreen } from "@/notes/components/NoteDetailScreen";
import { NoteEditorScreen } from "@/notes/components/NoteEditorScreen";
import { NotesListScreen } from "@/notes/components/NotesListScreen";
import { clearNoteDraft, readNoteDraft } from "@/notes/noteDraftStorage";
import { getNoteTitle } from "@/notes/noteSelectors";
import type { Note, NoteValues } from "@/notes/types";
import { useNotes } from "@/notes/useNotes";
import { notify } from "@/shared/notify";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { EmptyState } from "@/ui/EmptyState";

type Screen =
  | { name: "list" }
  | { name: "detail"; noteId: string }
  | { name: "editor"; noteId: string | null; draft?: NoteValues };

export function App() {
  const { notes, loadFailed, saveNote, togglePin, deleteNote } = useNotes();
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const [draftChecked, setDraftChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    readNoteDraft()
      .then((draft) => {
        if (draft) setScreen({ name: "editor", noteId: draft.noteId, draft });
      })
      .finally(() => setDraftChecked(true));
  }, []);

  if (loadFailed) {
    return <EmptyState title="Notes can’t load" message="Close this panel and open it again." />;
  }

  if (notes === null || !draftChecked) return null;

  const findNote = (id: string | null) => notes.find((note) => note.id === id);
  const detailNote = screen.name === "detail" ? findNote(screen.noteId) : undefined;
  const editorNote = screen.name === "editor" ? findNote(screen.noteId) : undefined;

  const showList = (noteId: string | null = null) => {
    setFocusNoteId(noteId);
    setScreen({ name: "list" });
  };

  const handleSave = async (noteId: string | null, values: NoteValues): Promise<boolean> => {
    try {
      const saved = await saveNote(noteId, values);
      await clearNoteDraft();
      notify.success("Note saved");
      setScreen({ name: "detail", noteId: saved.id });
      return true;
    } catch {
      notify.error("This note isn’t saved. Try again.");
      return false;
    }
  };

  const handleCancelEditing = (noteId: string | null) => {
    void clearNoteDraft();
    if (noteId) {
      setScreen({ name: "detail", noteId });
    } else {
      showList();
    }
  };

  const handleTogglePin = (id: string) => {
    togglePin(id).catch(() => notify.error("That change isn’t saved. Try again."));
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNote(noteToDelete.id);
      notify.success("Note deleted");
      setNoteToDelete(null);
      showList();
    } catch {
      notify.error("This note isn’t deleted. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <NotesListScreen
        notes={notes}
        query={query}
        focusNoteId={focusNoteId}
        isHidden={screen.name === "editor" || Boolean(detailNote)}
        onQueryChange={setQuery}
        onCreate={() => setScreen({ name: "editor", noteId: null })}
        onOpen={(noteId) => setScreen({ name: "detail", noteId })}
        onEdit={(noteId) => setScreen({ name: "editor", noteId })}
        onTogglePin={handleTogglePin}
        onDelete={setNoteToDelete}
      />
      {detailNote && (
        <NoteDetailScreen
          note={detailNote}
          onBack={() => showList(detailNote.id)}
          onEdit={() => setScreen({ name: "editor", noteId: detailNote.id })}
          onTogglePin={() => handleTogglePin(detailNote.id)}
          onDelete={() => setNoteToDelete(detailNote)}
        />
      )}
      {screen.name === "editor" && (
        <NoteEditorScreen
          key={screen.noteId ?? "new"}
          noteId={editorNote?.id ?? null}
          savedValues={editorNote}
          restoredDraft={screen.draft}
          onSave={handleSave}
          onCancel={handleCancelEditing}
        />
      )}
      <ConfirmDialog
        opened={noteToDelete !== null}
        title="Delete this note?"
        message={noteToDelete ? `“${getNoteTitle(noteToDelete)}” will be permanently deleted. This can’t be undone.` : ""}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        isBusy={isDeleting}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
