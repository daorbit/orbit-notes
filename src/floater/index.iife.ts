import { getImportantNotes } from "@/notes/noteSelectors";
import { readNotes, subscribeToNotes } from "@/notes/noteStorage";
import type { Note } from "@/notes/types";
import type { FloaterMessage } from "@/shared/messages";
import { readFloatersCollapsed, subscribeToFloatersCollapsed, writeFloatersCollapsed } from "./floaterStorage";
import { renderFloaters, type FloaterActions } from "./floaterView";
import floaterStyles from "./floater.css?inline";

const HOST_TAG = "orbit-notes-floaters";

document.querySelector(HOST_TAG)?.remove();

const host = document.createElement(HOST_TAG);
const shadow = host.attachShadow({ mode: "closed" });
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(floaterStyles);
shadow.adoptedStyleSheets = [styleSheet];

const stack = document.createElement("div");
stack.className = "stack";
stack.setAttribute("role", "complementary");
stack.setAttribute("aria-label", "Important notes");
shadow.append(stack);

let notes: Note[] = [];
let isCollapsed = false;

function sendMessage(message: FloaterMessage): void {
  if (!chrome.runtime?.id) {
    host.remove();
    return;
  }
  chrome.runtime.sendMessage(message).catch(console.error);
}

const actions: FloaterActions = {
  onOpenNote: (noteId) => sendMessage({ type: "open-panel", noteId }),
  onOpenPanel: () => sendMessage({ type: "open-panel" }),
  onRemove: (noteId) => sendMessage({ type: "remove-important", noteId }),
  onCollapsedChange: (next) => {
    writeFloatersCollapsed(next).catch(console.error);
  },
};

function update(): void {
  const importantNotes = getImportantNotes(notes);
  if (importantNotes.length === 0) {
    host.remove();
    delete stack.dataset.noteIds;
    return;
  }
  renderFloaters(stack, importantNotes, isCollapsed, actions);
  if (!host.isConnected) document.documentElement.append(host);
}

subscribeToNotes((next) => {
  notes = next;
  update();
});

subscribeToFloatersCollapsed((next) => {
  isCollapsed = next;
  update();
});

Promise.all([readNotes(), readFloatersCollapsed()])
  .then(([storedNotes, storedCollapsed]) => {
    notes = storedNotes;
    isCollapsed = storedCollapsed;
    update();
  })
  .catch(console.error);
