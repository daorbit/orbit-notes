import { useCallback, useEffect, useRef, useState } from "react";
import { NoteDetailScreen } from "@/notes/components/NoteDetailScreen";
import { NoteEditorScreen, type IncomingText } from "@/notes/components/NoteEditorScreen";
import { NotesListScreen } from "@/notes/components/NotesListScreen";
import { RecentlyDeletedScreen } from "@/notes/components/RecentlyDeletedScreen";
import { clearNoteDraft, readNoteDraft } from "@/notes/noteDraftStorage";
import type { PanelRequest } from "@/notes/panelRequest";
import type { Note, NoteDraft, NoteFilter, NoteSource, NoteValues } from "@/notes/types";
import { useNoteActions } from "@/notes/useNoteActions";
import { useNotes } from "@/notes/useNotes";
import { usePanelRequests } from "@/notes/usePanelRequests";
import { SettingsScreen } from "@/settings/SettingsScreen";
import { notify } from "@/shared/notify";
import { EmptyState } from "@/ui/EmptyState";

type Screen =
  | { name: "list" }
  | { name: "detail"; noteId: string }
  | { name: "editor"; noteId: string | null; draft?: NoteDraft; incomingText?: IncomingText }
  | { name: "settings" }
  | { name: "recently-deleted" };

export function App() {
  const { notes, loadFailed, saveNote, changeNoteState, deleteForever, importNotes } = useNotes();
  const actions = useNoteActions(changeNoteState);
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const [draftChecked, setDraftChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);
  const incomingTextId = useRef(0);

  useEffect(() => {
    readNoteDraft()
      .then((draft) => {
        if (draft) setScreen({ name: "editor", noteId: draft.noteId, draft });
      })
      .finally(() => setDraftChecked(true));
  }, []);

  const handlePanelRequest = useCallback((request: PanelRequest) => {
    if (request.type === "open-note") {
      setScreen((current) => (current.name === "editor" ? current : { name: "detail", noteId: request.noteId }));
      return;
    }

    const { values, source } = request;
    incomingTextId.current += 1;
    const incomingText = { id: incomingTextId.current, text: [values.title, values.body].filter(Boolean).join("\n") };
    setScreen((current) =>
      current.name === "editor" ? { ...current, incomingText } : { name: "editor", noteId: null, draft: { ...values, noteId: null, source } },
    );
  }, []);

  usePanelRequests(draftChecked, handlePanelRequest);

  if (loadFailed) {
    return <EmptyState title="Notes can’t load" message="Close this panel and open it again." />;
  }

  if (notes === null || !draftChecked) return null;

  const findNote = (id: string | null) => notes.find((note) => note.id === id && note.deletedAt === undefined);
  const detailNote = screen.name === "detail" ? findNote(screen.noteId) : undefined;
  const editorNote = screen.name === "editor" ? findNote(screen.noteId) : undefined;
  const isListHidden = !(screen.name === "list" || (screen.name === "detail" && !detailNote));

  const showList = (noteId: string | null = null) => {
    setFocusNoteId(noteId);
    setScreen({ name: "list" });
  };

  const handleSave = async (noteId: string | null, values: NoteValues, source?: NoteSource): Promise<boolean> => {
    try {
      const saved = await saveNote(noteId, values, source);
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

  const handleDeleteFromDetail = (note: Note) => {
    actions.moveToTrash(note);
    showList();
  };

  return (
    <>
      <NotesListScreen
        notes={notes}
        query={query}
        filter={filter}
        focusNoteId={focusNoteId}
        isHidden={isListHidden}
        actions={actions}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onCreate={() => setScreen({ name: "editor", noteId: null })}
        onOpen={(noteId) => setScreen({ name: "detail", noteId })}
        onEdit={(noteId) => setScreen({ name: "editor", noteId })}
        onOpenSettings={() => setScreen({ name: "settings" })}
      />
      {detailNote && (
        <NoteDetailScreen
          note={detailNote}
          actions={actions}
          onBack={() => showList(detailNote.id)}
          onEdit={() => setScreen({ name: "editor", noteId: detailNote.id })}
          onDelete={() => handleDeleteFromDetail(detailNote)}
        />
      )}
      {screen.name === "editor" && (
        <NoteEditorScreen
          key={screen.noteId ?? "new"}
          noteId={editorNote?.id ?? null}
          savedValues={editorNote}
          restoredDraft={screen.draft}
          incomingText={screen.incomingText}
          onSave={handleSave}
          onCancel={handleCancelEditing}
        />
      )}
      {screen.name === "settings" && (
        <SettingsScreen
          notes={notes}
          onBack={() => showList()}
          onOpenRecentlyDeleted={() => setScreen({ name: "recently-deleted" })}
          onImportNotes={importNotes}
        />
      )}
      {screen.name === "recently-deleted" && (
        <RecentlyDeletedScreen
          notes={notes}
          onBack={() => setScreen({ name: "settings" })}
          onRestore={actions.restore}
          onDeleteForever={deleteForever}
        />
      )}
    </>
  );
}
