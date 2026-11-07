import { CLOSE_DRAWER_MESSAGE, DRAWER_PAGE_PATH } from "@/shared/drawer";
import hostStyles from "./drawerHost.css?inline";

const OPEN_CLASS = "isOpen";

export type Drawer = {
  toggle: () => void;
};

function createStyleSheet(): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(hostStyles);
  return sheet;
}

function getFocusedElement(): HTMLElement | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLElement ? active : null;
}

export function createDrawer(): Drawer {
  const host = document.createElement("orbit-notes-drawer");
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.adoptedStyleSheets = [createStyleSheet()];

  const panel = document.createElement("div");
  panel.className = "drawer";
  panel.inert = true;

  const frame = document.createElement("iframe");
  frame.className = "frame";
  frame.title = "Orbit Notes";
  frame.src = chrome.runtime.getURL(DRAWER_PAGE_PATH);

  panel.append(frame);
  shadow.append(panel);
  document.documentElement.append(host);

  let isOpen = false;
  let focusBeforeOpen: HTMLElement | null = null;

  const open = () => {
    isOpen = true;
    focusBeforeOpen = getFocusedElement();
    panel.inert = false;
    panel.getBoundingClientRect();
    panel.classList.add(OPEN_CLASS);
    frame.focus();
  };

  const close = () => {
    const frameHadFocus = shadow.activeElement === frame;
    isOpen = false;
    panel.classList.remove(OPEN_CLASS);
    panel.inert = true;
    if (frameHadFocus) focusBeforeOpen?.focus({ preventScroll: true });
    focusBeforeOpen = null;
  };

  frame.addEventListener("load", () => {
    if (isOpen) frame.focus();
  });

  window.addEventListener("message", (event) => {
    if (event.source === frame.contentWindow && event.data === CLOSE_DRAWER_MESSAGE) {
      close();
    }
  });

  return {
    toggle: () => (isOpen ? close() : open()),
  };
}
