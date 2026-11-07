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
  description: "Quick notes, in a side panel.",
  version: pkg.version,
  icons,
  action: {
    default_icon: icons,
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  side_panel: {
    default_path: "src/panel/index.html",
  },
  permissions: ["sidePanel", "storage"],
});
