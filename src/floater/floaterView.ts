import type { Note } from "@/notes/types";
import type { FloaterActions } from "./floaterActions";
import { createCard } from "./floaterCard";
import { createButton, createElement, createIconButton } from "./floaterDom";
import { createMenu, positionMenu } from "./floaterMenu";
import type { FloaterCorner } from "./floaterPreferences";
import { createIcon } from "./icons";

export type FloaterReceipt = {
  message: string;
  canUndo: boolean;
};

export type FloaterViewState = {
  notes: Note[];
  isMinimized: boolean;
  isExpanded: boolean;
  corner: FloaterCorner;
  menuNoteId: string | null;
  receipt: FloaterReceipt | null;
  completingIds: Set<string>;
  newIds: Set<string>;
  now: number;
};

function createNoteCard(note: Note, state: FloaterViewState, actions: FloaterActions): HTMLElement {
  return createCard(
    note,
    {
      isNew: state.newIds.has(note.id),
      isCompleting: state.completingIds.has(note.id),
      isMenuOpen: state.menuNoteId === note.id,
    },
    actions,
  );
}

function createPill(count: number, actions: FloaterActions): HTMLElement {
  const pill = createButton("pill glass", "pill", actions.onRestore);
  pill.setAttribute("aria-label", `Show ${count} important ${count === 1 ? "note" : "notes"}`);
  pill.append(createIcon("flag"), `${count} important`);
  return pill;
}

function createPile(state: FloaterViewState, actions: FloaterActions): HTMLElement {
  const [topNote, ...otherNotes] = state.notes;
  const pile = createElement("div", "pile");

  if (otherNotes.length > 0) {
    pile.classList.add("hasPeek");
    const peek = createButton("peekButton", "expand", actions.onExpand);
    peek.setAttribute("aria-label", `Show all ${state.notes.length} important notes`);
    if (otherNotes.length > 1) peek.append(createElement("span", "peek peekBack glass"));
    peek.append(createElement("span", "peek peekFront glass", `${otherNotes.length} more`));
    pile.append(peek);
  }

  pile.append(createNoteCard(topNote, state, actions));
  return pile;
}

function createExpandedList(state: FloaterViewState, actions: FloaterActions, previousScrollTop: number): HTMLElement[] {
  const header = createElement("div", "listHeader glass");
  header.append(createElement("span", "listTitle", `${state.notes.length} important`));
  const showLess = createButton("showLess", "collapse", actions.onCollapse);
  showLess.textContent = "Show less";
  header.append(showLess, createIconButton("minimize", "Minimize important notes", "minimize", actions.onMinimize));

  const list = createElement("div", "list");
  list.append(...state.notes.map((note) => createNoteCard(note, state, actions)));
  queueMicrotask(() => {
    list.scrollTop = previousScrollTop;
  });
  return [header, list];
}

function createReceipt(receipt: FloaterReceipt, actions: FloaterActions): HTMLElement {
  const element = createElement("div", "receipt glass");
  element.append(createElement("span", "receiptMessage", receipt.message));
  if (receipt.canUndo) {
    const undo = createButton("undo", "undo", actions.onUndo);
    undo.textContent = "Undo";
    element.append(undo);
  }
  return element;
}

function createStackContent(state: FloaterViewState, actions: FloaterActions, previousScrollTop: number): HTMLElement[] {
  if (state.notes.length === 0) return [];
  if (state.isMinimized) return [createPill(state.notes.length, actions)];
  if (state.isExpanded && state.notes.length > 1) return createExpandedList(state, actions, previousScrollTop);
  return [createPile(state, actions)];
}

export function renderFloaters(container: HTMLElement, state: FloaterViewState, actions: FloaterActions): void {
  const previousScrollTop = container.querySelector(".list")?.scrollTop ?? 0;
  const content = createStackContent(state, actions, previousScrollTop);
  if (state.receipt) content.push(createReceipt(state.receipt, actions));

  const menuNote = state.notes.find((note) => note.id === state.menuNoteId);
  const menu = menuNote && createMenu(menuNote, state.corner, state.now, actions);
  if (menu) content.push(menu);

  container.dataset.corner = state.corner;
  container.replaceChildren(...content);

  const trigger = menuNote && container.querySelector<HTMLElement>(`[data-focus-key="menu-${menuNote.id}"]`);
  if (menu && trigger) positionMenu(menu, trigger, container, state.corner);
}
