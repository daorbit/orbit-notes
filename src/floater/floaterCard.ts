import { getNoteDescription, getNoteTitle } from "@/notes/noteSelectors";
import type { Note } from "@/notes/types";
import type { FloaterActions } from "./floaterActions";
import { createButton, createElement, createIconButton } from "./floaterDom";
import { createIcon } from "./icons";

type CardState = {
  isNew: boolean;
  isCompleting: boolean;
  isMenuOpen: boolean;
};

function getCardClass({ isNew, isCompleting }: CardState): string {
  return ["card", "glass", isNew && "isNew", isCompleting && "isCompleting"].filter(Boolean).join(" ");
}

function createCheck(note: Note, title: string, actions: FloaterActions): HTMLButtonElement {
  const check = createButton("check", `check-${note.id}`, () => actions.onComplete(note));
  check.setAttribute("aria-label", `Mark ${title} as done`);
  check.title = "Mark as done";
  const ring = createElement("span", "ring");
  ring.append(createIcon("check"));
  check.append(ring);
  return check;
}

function trackSheen(card: HTMLElement): void {
  card.addEventListener("pointermove", (event) => {
    const { left, width } = card.getBoundingClientRect();
    card.style.setProperty("--sheen-x", `${((event.clientX - left) / width) * 100}%`);
  });
}

export function createCard(note: Note, state: CardState, actions: FloaterActions): HTMLElement {
  const title = getNoteTitle(note);
  const description = getNoteDescription(note);
  const card = createElement("article", getCardClass(state));
  trackSheen(card);

  const open = createButton("open", `open-${note.id}`, () => actions.onOpenNote(note));
  open.setAttribute("aria-label", `Open note: ${title}`);
  open.append(createElement("span", "title", title));
  if (description) open.append(createElement("span", "description", description));

  const menuButton = createIconButton("more", `More actions for ${title}`, `menu-${note.id}`, () => actions.onToggleMenu(note));
  menuButton.setAttribute("aria-haspopup", "menu");
  menuButton.setAttribute("aria-expanded", String(state.isMenuOpen));

  const controls = createElement("div", "controls");
  controls.append(menuButton, createIconButton("minimize", "Minimize important notes", "minimize", actions.onMinimize));

  card.append(createCheck(note, title, actions), open, controls);
  return card;
}
