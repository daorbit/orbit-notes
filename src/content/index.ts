import { createDrawer, type Drawer } from "./createDrawer";

declare global {
  interface Window {
    orbitNotesDrawer?: Drawer;
  }
}

window.orbitNotesDrawer ??= createDrawer();
window.orbitNotesDrawer.toggle();
