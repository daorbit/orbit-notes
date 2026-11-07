import { getNoteColor, NOTE_COLORS } from "@/notes/noteColors";
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

function createPickerOption(className: string, focusKey: string, label: string, title: string, isChecked: boolean, onClick: () => void): HTMLButtonElement {
  const option = createButton(className, focusKey, onClick);
  option.setAttribute("role", "menuitemradio");
  option.setAttribute("aria-checked", String(isChecked));
  option.setAttribute("aria-label", label);
  option.title = title;
  option.tabIndex = -1;
  return option;
}

function createPickerRow(label: string, options: HTMLElement[]): HTMLElement {
  const row = createElement("div", "menuRow");
  const picker = createElement("div", "picker");
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", label);
  picker.append(...options);
  row.append(createElement("span", "menuLabel", label), picker);
  return row;
}

function createColorRow(note: Note, actions: FloaterActions): HTMLElement {
  const currentColor = getNoteColor(note);
  const options = NOTE_COLORS.map(({ value, label }) => {
    const option = createPickerOption("colorOption", `menu-color-${value}`, `Color ${label.toLowerCase()}`, label, value === currentColor, () => actions.onColor(note, value));
    option.dataset.swatch = value;
    return option;
  });
  return createPickerRow("Color", options);
}

function createCornerRow(currentCorner: FloaterCorner, actions: FloaterActions): HTMLElement {
  const options = FLOATER_CORNERS.map((corner) => {
    const label = CORNER_LABELS[corner];
    const option = createPickerOption("cornerOption", `menu-corner-${corner}`, `Move to ${label.toLowerCase()}`, label, corner === currentCorner, () => actions.onMoveTo(corner));
    option.dataset.corner = corner;
    return option;
  });
  return createPickerRow("Position", options);
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

export function createMenu(note: Note, corner: FloaterCorner, now: number, actions: FloaterActions): HTMLElement {
  const menu = createElement("div", "menu glass");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Note actions");

  menu.append(createElement("div", "menuHeading", "Snooze"));
  getSnoozeOptions(now).forEach((option, index) => {
    menu.append(createMenuItem(option.label, `menu-snooze-${index}`, () => actions.onSnooze(note, option), option.detail));
  });

  menu.append(
    createElement("div", "menuSeparator"),
    createColorRow(note, actions),
    createCornerRow(corner, actions),
    createElement("div", "menuSeparator"),
    createMenuItem("Hide on this site", "menu-hide-site", actions.onHideSite),
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
  menu.style.setProperty("--menu-left", `${Math.max(0, triggerRect.right - stackRect.left - menu.offsetWidth)}px`);
  menu.style.setProperty("--menu-offset", `${opensUp ? stackRect.bottom - triggerRect.top + 6 : triggerRect.bottom - stackRect.top + 6}px`);
  menu.style.setProperty("--menu-max-height", `${(opensUp ? triggerRect.top : window.innerHeight - triggerRect.bottom) - 18}px`);
}
