import { createIcon, type IconName } from "./icons";

export function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function createButton(className: string, focusKey: string, onClick: () => void): HTMLButtonElement {
  const button = createElement("button", className);
  button.type = "button";
  button.dataset.focusKey = focusKey;
  button.addEventListener("click", onClick);
  return button;
}

export function createIconButton(icon: IconName, label: string, focusKey: string, onClick: () => void): HTMLButtonElement {
  const button = createButton("control", focusKey, onClick);
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(createIcon(icon));
  return button;
}
