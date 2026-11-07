import type { FloaterCorner } from "./floaterPreferences";

const DRAG_THRESHOLD_PX = 6;

function getNearestCorner(rect: DOMRect): FloaterCorner {
  const vertical = rect.top + rect.height / 2 < window.innerHeight / 2 ? "top" : "bottom";
  const horizontal = rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
  return `${vertical}-${horizontal}`;
}

function setOffset(stack: HTMLElement, x: number, y: number): void {
  stack.style.setProperty("--drag-x", `${x}px`);
  stack.style.setProperty("--drag-y", `${y}px`);
}

function suppressNextClick(stack: HTMLElement): void {
  const stop = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  stack.addEventListener("click", stop, { capture: true, once: true });
  setTimeout(() => stack.removeEventListener("click", stop, { capture: true }), 0);
}

export function attachCornerDrag(stack: HTMLElement, onDrop: (corner: FloaterCorner) => void): void {
  let start: { x: number; y: number } | null = null;
  let isDragging = false;

  stack.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || (event.target as Element).closest(".menu")) return;
    start = { x: event.clientX, y: event.clientY };
  });

  stack.addEventListener("pointermove", (event) => {
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (!isDragging && Math.hypot(x, y) < DRAG_THRESHOLD_PX) return;
    if (!isDragging) {
      isDragging = true;
      stack.setPointerCapture(event.pointerId);
      stack.classList.add("isDragging");
    }
    setOffset(stack, x, y);
  });

  const finish = () => {
    start = null;
    if (!isDragging) return;
    isDragging = false;
    suppressNextClick(stack);

    const before = stack.getBoundingClientRect();
    onDrop(getNearestCorner(before));
    setOffset(stack, 0, 0);
    const after = stack.getBoundingClientRect();
    setOffset(stack, before.left - after.left, before.top - after.top);
    stack.getBoundingClientRect();
    stack.classList.remove("isDragging");
    setOffset(stack, 0, 0);
  };

  stack.addEventListener("pointerup", finish);
  stack.addEventListener("pointercancel", finish);
}
