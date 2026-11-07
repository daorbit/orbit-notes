import { CLOSE_DRAWER_MESSAGE } from "@/shared/drawer";

export const isEmbedded = window.parent !== window;

export function closeDrawer(): void {
  if (isEmbedded) window.parent.postMessage(CLOSE_DRAWER_MESSAGE, "*");
}
