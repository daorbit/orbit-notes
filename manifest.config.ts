import { defineDynamicResource, defineManifest } from "@crxjs/vite-plugin";
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
  description: "Capture a thought without leaving the page.",
  version: pkg.version,
  icons,
  action: {
    default_icon: icons,
    default_title: "Orbit Notes",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  permissions: ["activeTab", "scripting", "storage"],
  commands: {
    _execute_action: {
      suggested_key: {
        default: "Alt+Shift+N",
      },
    },
  },
  web_accessible_resources: [
    {
      resources: ["src/drawer/index.html", "assets/*"],
      matches: ["<all_urls>"],
      use_dynamic_url: true,
    },
    defineDynamicResource({
      matches: ["<all_urls>"],
      use_dynamic_url: true,
    }),
  ],
});
