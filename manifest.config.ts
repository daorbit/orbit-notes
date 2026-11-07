import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json" with { type: "json" };

const icons = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};

export default defineManifest({
  manifest_version: 3,
  name: "Orbit Notes",
  description: "Your notes, in the browser side panel.",
  version: pkg.version,
  icons,
  action: {
    default_icon: icons,
    default_title: "Open Orbit Notes",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  side_panel: {
    default_path: "src/panel/index.html",
  },
  permissions: ["sidePanel", "storage"],
  commands: {
    "open-notes": {
      suggested_key: {
        default: "Alt+Shift+N",
      },
      description: "Open Orbit Notes",
    },
  },
});
