import contentScript from "../content/index.ts?iife";
import { DRAWER_PAGE_PATH } from "@/shared/drawer";

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentScript],
    });
  } catch {
    const notesPageUrl = chrome.runtime.getURL(DRAWER_PAGE_PATH);
    if (tab.url !== notesPageUrl) {
      await chrome.tabs.create({ url: notesPageUrl });
    }
  }
});
