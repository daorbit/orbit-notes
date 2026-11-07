import { getNoteDescription, getNoteTitle } from "@/notes/noteSelectors";
import type { Note } from "@/notes/types";
import { createIcon, type IconName } from "./icons";

const MAX_VISIBLE_CARDS = 3;

export type FloaterActions = {
  onOpenNote: (noteId: string) => void;
  onOpenPanel: () => void;
  onRemove: (noteId: string) => void;
  onCollapsedChange: (isCollapsed: boolean) => void;
};

function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createButton(className: string, onClick: () => void): HTMLButtonElement {
  const button = createElement("button", className);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function createIconButton(icon: IconName, label: string, onClick: () => void): HTMLButtonElement {
  const button = createButton("control", onClick);
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(createIcon(icon));
  return button;
}

function createCard(note: Note, isNew: boolean, actions: FloaterActions): HTMLElement {
  const title = getNoteTitle(note);
  const description = getNoteDescription(note);
  const card = createElement("article", isNew ? "card isNew" : "card");

  const open = createButton("open", () => actions.onOpenNote(note.id));
  open.setAttribute("aria-label", `Open note: ${title}`);
  open.append(createIcon("flag"));
  const text = createElement("span", "text");
  text.append(createElement("span", "title", title));
  if (description) text.append(createElement("span", "description", description));
  open.append(text);

  const controls = createElement("div", "controls");
  controls.append(
    createIconButton("minimize", "Minimize important notes", () => actions.onCollapsedChange(true)),
    createIconButton("close", `Remove ${title} from tabs`, () => actions.onRemove(note.id)),
  );

  card.append(open, controls);
  return card;
}

export function renderFloaters(container: HTMLElement, notes: Note[], isCollapsed: boolean, actions: FloaterActions): void {
  const previousIds = new Set(container.dataset.noteIds?.split(",").filter(Boolean));
  const hasRendered = container.dataset.noteIds !== undefined;
  container.dataset.noteIds = notes.map((note) => note.id).join(",");

  if (isCollapsed) {
    const pill = createButton("pill", () => actions.onCollapsedChange(false));
    pill.setAttribute("aria-label", `Show ${notes.length} important ${notes.length === 1 ? "note" : "notes"}`);
    pill.append(createIcon("flag"), `${notes.length} important`);
    container.replaceChildren(pill);
    return;
  }

  const cards = notes
    .slice(0, MAX_VISIBLE_CARDS)
    .map((note) => createCard(note, hasRendered && !previousIds.has(note.id), actions));
  const hiddenCount = notes.length - MAX_VISIBLE_CARDS;

  if (hiddenCount > 0) {
    const more = createButton("more", actions.onOpenPanel);
    more.textContent = `${hiddenCount} more important`;
    container.replaceChildren(...cards, more);
  } else {
    container.replaceChildren(...cards);
  }
}
