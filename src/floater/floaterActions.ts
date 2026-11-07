import type { SnoozeOption } from "@/notes/noteSnooze";
import type { Note, NoteColor } from "@/notes/types";
import type { FloaterCorner } from "./floaterPreferences";

export type FloaterActions = {
  onOpenNote: (note: Note) => void;
  onComplete: (note: Note) => void;
  onToggleMenu: (note: Note) => void;
  onCloseMenu: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onSnooze: (note: Note, option: SnoozeOption) => void;
  onColor: (note: Note, color: NoteColor) => void;
  onMoveTo: (corner: FloaterCorner) => void;
  onHideSite: () => void;
  onRemove: (note: Note) => void;
  onUndo: () => void;
};
