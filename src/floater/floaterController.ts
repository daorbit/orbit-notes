import { describeSnooze, type SnoozeOption } from "@/notes/noteSnooze";
import { getFloatingNotes, getNextSnoozeEnd, getNoteTitle } from "@/notes/noteSelectors";
import { applyNoteState, type NoteStateChange } from "@/notes/noteState";
import { readNotes, subscribeToNotes } from "@/notes/noteStorage";
import type { Note } from "@/notes/types";
import type { FloaterMessage } from "@/shared/messages";
import type { FloaterActions } from "./floaterActions";
import { attachCornerDrag } from "./floaterDrag";
import { FIRST_MENU_ITEM_KEY } from "./floaterMenu";
import {
  readFloaterPreferences,
  subscribeToFloaterPreferences,
  updateFloaterPreferences,
  type FloaterCorner,
  type FloaterPreferences,
} from "./floaterPreferences";
import { renderFloaters, type FloaterReceipt } from "./floaterView";
import { detectPageAppearance } from "./pageAppearance";

const COMPLETE_ANIMATION_MS = 420;
const RECEIPT_DURATION_MS = 6000;
const RECEIPT_RECHECK_MS = 1500;
const RECEIPT_MAX_DURATION_MS = 20000;
const SCROLL_SETTLE_MS = 180;
const APPEARANCE_SAMPLE_INSET_PX = 40;
const MAX_TIMER_MS = 2_147_483_647;
const SAVE_FAILED = "That change isn’t saved. Reload this page.";

type ControllerElements = {
  host: HTMLElement;
  shadow: ShadowRoot;
  stack: HTMLElement;
  announcer: HTMLElement;
};

export function startFloaterController({ host, shadow, stack, announcer }: ControllerElements): void {
  const site = location.hostname;

  let notes: Note[] = [];
  let preferences: FloaterPreferences | null = null;
  let isExpanded = false;
  let menuNoteId: string | null = null;
  let receipt: FloaterReceipt | null = null;
  let undoReceipt: (() => void) | null = null;
  let receiptShownAt = 0;
  let receiptTimer: ReturnType<typeof setTimeout> | undefined;
  let snoozeTimer: ReturnType<typeof setTimeout> | undefined;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let pendingFocusKey: string | null = null;
  let renderedIds: Set<string> | null = null;
  const completingIds = new Set<string>();

  function send(message: FloaterMessage): Promise<unknown> {
    if (!chrome.runtime?.id) {
      host.remove();
      return Promise.resolve(undefined);
    }
    return chrome.runtime.sendMessage(message);
  }

  function getVisibleNotes(now: number): Note[] {
    if (!preferences?.isEnabled || preferences.hiddenSites.includes(site)) return [];
    return getFloatingNotes(notes, now);
  }

  function scheduleSnoozeEnd(now: number): void {
    clearTimeout(snoozeTimer);
    const next = getNextSnoozeEnd(notes, now);
    if (next !== null) snoozeTimer = setTimeout(render, Math.min(next - now + 50, MAX_TIMER_MS));
  }

  function updateAppearance(): void {
    if (!host.isConnected || !preferences) return;
    const { left, right, top, bottom } = stack.getBoundingClientRect();
    const [vertical, horizontal] = preferences.corner.split("-");
    stack.dataset.appearance = detectPageAppearance(host, {
      x: horizontal === "left" ? left + APPEARANCE_SAMPLE_INSET_PX : right - APPEARANCE_SAMPLE_INSET_PX,
      y: vertical === "top" ? top + APPEARANCE_SAMPLE_INSET_PX : bottom - APPEARANCE_SAMPLE_INSET_PX,
    });
  }

  function restoreFocus(previousKey: string | undefined): void {
    const key = pendingFocusKey ?? previousKey;
    pendingFocusKey = null;
    if (key) stack.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus({ preventScroll: true });
  }

  function render(): void {
    if (!preferences) return;
    const now = Date.now();
    const visibleNotes = getVisibleNotes(now);
    scheduleSnoozeEnd(now);

    if (visibleNotes.length === 0 && !receipt) {
      host.remove();
      renderedIds = null;
      menuNoteId = null;
      isExpanded = false;
      return;
    }

    const previousFocus = (shadow.activeElement as HTMLElement | null)?.dataset.focusKey;
    const ids = new Set(visibleNotes.map((note) => note.id));
    const newIds = new Set(renderedIds ? [...ids].filter((id) => !renderedIds?.has(id)) : []);
    renderedIds = ids;
    if (menuNoteId && !ids.has(menuNoteId)) menuNoteId = null;

    renderFloaters(
      stack,
      {
        notes: visibleNotes,
        isMinimized: preferences.isMinimized,
        isExpanded,
        corner: preferences.corner,
        menuNoteId,
        receipt,
        completingIds,
        newIds,
        now,
      },
      actions,
    );

    if (!host.isConnected) document.documentElement.append(host);
    updateAppearance();
    restoreFocus(previousFocus);
  }

  function dismissReceipt(): void {
    clearTimeout(receiptTimer);
    receipt = null;
    undoReceipt = null;
    render();
  }

  function expireReceipt(): void {
    const isInUse = stack.matches(":hover") || shadow.activeElement?.matches(":focus-visible");
    if (isInUse && Date.now() - receiptShownAt < RECEIPT_MAX_DURATION_MS) {
      receiptTimer = setTimeout(expireReceipt, RECEIPT_RECHECK_MS);
    } else {
      dismissReceipt();
    }
  }

  function showReceipt(message: string, undo: (() => void) | null): void {
    clearTimeout(receiptTimer);
    receipt = { message, canUndo: undo !== null };
    receiptShownAt = Date.now();
    undoReceipt = undo;
    announcer.textContent = message;
    if (undo) pendingFocusKey = "undo";
    receiptTimer = setTimeout(expireReceipt, RECEIPT_DURATION_MS);
  }

  function changeNote(note: Note, change: NoteStateChange): void {
    notes = notes.map((current) => (current.id === note.id ? applyNoteState(current, change) : current));
    send({ type: "update-note", noteId: note.id, change })
      .then((isSaved) => {
        if (isSaved === false) throw new Error(SAVE_FAILED);
      })
      .catch(async (error: unknown) => {
        console.error(error);
        notes = await readNotes();
        showReceipt(SAVE_FAILED, null);
        render();
      });
  }

  function changeNoteWithUndo(note: Note, change: NoteStateChange, undoChange: NoteStateChange, message: string): void {
    menuNoteId = null;
    changeNote(note, change);
    showReceipt(message, () => {
      pendingFocusKey = `open-${note.id}`;
      changeNote(note, undoChange);
      dismissReceipt();
    });
    render();
  }

  function setPreferences(change: Partial<FloaterPreferences>): void {
    if (preferences) preferences = { ...preferences, ...change };
    updateFloaterPreferences(change).catch(console.error);
    render();
  }

  function moveTo(corner: FloaterCorner): void {
    menuNoteId = null;
    setPreferences({ corner });
  }

  const actions: FloaterActions = {
    onOpenNote: (note) => {
      send({ type: "open-panel", noteId: note.id }).catch(console.error);
    },

    onComplete: (note) => {
      if (completingIds.has(note.id)) return;
      completingIds.add(note.id);
      render();
      setTimeout(() => {
        completingIds.delete(note.id);
        changeNoteWithUndo(note, { doneAt: Date.now(), snoozedUntil: null }, { doneAt: null, snoozedUntil: note.snoozedUntil ?? null }, "Marked as done");
      }, COMPLETE_ANIMATION_MS);
    },

    onToggleMenu: (note) => {
      const isOpening = menuNoteId !== note.id;
      menuNoteId = isOpening ? note.id : null;
      pendingFocusKey = isOpening ? FIRST_MENU_ITEM_KEY : `menu-${note.id}`;
      render();
    },

    onCloseMenu: () => {
      pendingFocusKey = menuNoteId && `menu-${menuNoteId}`;
      menuNoteId = null;
      render();
    },

    onMinimize: () => {
      menuNoteId = null;
      isExpanded = false;
      pendingFocusKey = "pill";
      setPreferences({ isMinimized: true });
    },

    onRestore: () => setPreferences({ isMinimized: false }),

    onExpand: () => {
      isExpanded = true;
      pendingFocusKey = "collapse";
      render();
    },

    onCollapse: () => {
      isExpanded = false;
      menuNoteId = null;
      pendingFocusKey = "expand";
      render();
    },

    onSnooze: (note, option: SnoozeOption) => {
      changeNoteWithUndo(note, { snoozedUntil: option.until }, { snoozedUntil: note.snoozedUntil ?? null }, describeSnooze(option.until, Date.now()));
    },

    onColor: (note, color) => {
      pendingFocusKey = `menu-color-${color}`;
      changeNote(note, { color });
      render();
    },

    onMoveTo: moveTo,

    onHideSite: () => {
      if (!preferences) return;
      const hiddenSites = preferences.hiddenSites;
      menuNoteId = null;
      showReceipt(`Hidden on ${site.replace(/^www\./, "")}`, () => {
        setPreferences({ hiddenSites });
        dismissReceipt();
      });
      setPreferences({ hiddenSites: [...hiddenSites, site] });
    },

    onRemove: (note) => {
      changeNoteWithUndo(note, { important: false, snoozedUntil: null }, { important: true, snoozedUntil: note.snoozedUntil ?? null }, `Removed ${getNoteTitle(note)} from tabs`);
    },

    onUndo: () => undoReceipt?.(),
  };

  attachCornerDrag(stack, moveTo);

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (menuNoteId && event.composedPath()[0] !== host) actions.onCloseMenu();
    },
    true,
  );

  stack.addEventListener("pointerdown", (event) => {
    if (menuNoteId && !(event.target as Element).closest(".menu, [aria-haspopup]")) actions.onCloseMenu();
  });

  stack.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuNoteId) actions.onCloseMenu();
  });

  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateAppearance, SCROLL_SETTLE_MS);
    },
    { capture: true, passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });

  subscribeToNotes((next) => {
    notes = next;
    render();
  });

  subscribeToFloaterPreferences((next) => {
    preferences = next;
    render();
  });

  Promise.all([readNotes(), readFloaterPreferences()])
    .then(([storedNotes, storedPreferences]) => {
      notes = storedNotes;
      preferences = storedPreferences;
      render();
    })
    .catch(console.error);
}
