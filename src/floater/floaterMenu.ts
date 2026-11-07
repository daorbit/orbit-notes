import { getSnoozeOptions } from "@/notes/noteSnooze";
import type { Note } from "@/notes/types";
import type { FloaterActions } from "./floaterActions";
import { createButton, createElement } from "./floaterDom";
import { FLOATER_CORNERS, type FloaterCorner } from "./floaterPreferences";

const CORNER_LABELS: Record<FloaterCorner, string> = {
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
};

export const FIRST_MENU_ITEM_KEY = "menu-snooze-0";

function createMenuItem(label: string, focusKey: string, onClick: () => void, detail?: string): HTMLButtonElement {
  const item = createButton("menuItem", focusKey, onClick);
  item.setAttribute("role", "menuitem");
  item.tabIndex = -1;
  item.append(createElement("span", "menuLabel", label));
  if (detail) item.append(createElement("span", "menuDetail", detail));
  return item;
}

function createCornerPicker(currentCorner: FloaterCorner, actions: FloaterActions): HTMLElement {
  const picker = createElement("div", "cornerPicker");
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", "Move to");

  for (const corner of FLOATER_CORNERS) {
    const option = createButton("cornerOption", `menu-corner-${corner}`, () => actions.onMoveTo(corner));
    option.dataset.corner = corner;
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", String(corner === currentCorner));
    option.setAttribute("aria-label", `Move to ${CORNER_LABELS[corner].toLowerCase()}`);
    option.title = CORNER_LABELS[corner];
    option.tabIndex = -1;
    picker.append(option);
  }

  return picker;
}

function moveFocus(menu: HTMLElement, key: string): void {
  const items = [...menu.querySelectorAll<HTMLElement>("button")];
  const current = items.indexOf((menu.getRootNode() as ShadowRoot).activeElement as HTMLElement);
  const last = items.length - 1;
  const targets: Record<string, number> = {
    ArrowDown: current >= last ? 0 : current + 1,
    ArrowRight: current >= last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
    ArrowLeft: current <= 0 ? last : current - 1,
    Home: 0,
    End: last,
  };
  items[targets[key]]?.focus();
}

function handleMenuKeys(menu: HTMLElement, actions: FloaterActions): void {
  menu.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      actions.onCloseMenu();
    } else if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      moveFocus(menu, event.key);
    }
  });
}

export function createMenu(note: Note, corner: FloaterCorner, site: string, now: number, actions: FloaterActions): HTMLElement {
  const menu = createElement("div", "menu glass");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Note actions");

  menu.append(createElement("div", "menuHeading", "Snooze"));
  getSnoozeOptions(now).forEach((option, index) => {
    menu.append(createMenuItem(option.label, `menu-snooze-${index}`, () => actions.onSnooze(note, option), option.detail));
  });

  menu.append(createElement("div", "menuSeparator"), createElement("div", "menuHeading", "Move to"), createCornerPicker(corner, actions));
  menu.append(
    createElement("div", "menuSeparator"),
    createMenuItem(`Hide on ${site}`, "menu-hide-site", actions.onHideSite),
    createMenuItem("Remove from tabs", "menu-remove", () => actions.onRemove(note)),
  );

  handleMenuKeys(menu, actions);
  return menu;
}

export function positionMenu(menu: HTMLElement, trigger: HTMLElement, stack: HTMLElement, corner: FloaterCorner): void {
  const triggerRect = trigger.getBoundingClientRect();
  const stackRect = stack.getBoundingClientRect();
  const opensUp = corner.startsWith("bottom");

  menu.classList.toggle("opensUp", opensUp);
  menu.style.setProperty("--menu-right", `${stackRect.right - triggerRect.right}px`);
  menu.style.setProperty("--menu-offset", `${opensUp ? stackRect.bottom - triggerRect.top + 6 : triggerRect.bottom - stackRect.top + 6}px`);
  menu.style.setProperty("--menu-max-height", `${(opensUp ? triggerRect.top : window.innerHeight - triggerRect.bottom) - 18}px`);
}
