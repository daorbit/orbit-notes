import { requestNoteOpen } from "@/notes/noteOpenRequest";
import { removeNoteImportant } from "@/notes/noteStorage";
import type { FloaterMessage } from "@/shared/messages";

async function showFloatersInOpenTabs(): Promise<void> {
  const files = chrome.runtime.getManifest().content_scripts?.[0]?.js;
  if (!files) return;
  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  await Promise.allSettled(
    tabs.map((tab) => (tab.id === undefined ? undefined : chrome.scripting.executeScript({ target: { tabId: tab.id }, files }))),
  );
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
  showFloatersInOpenTabs().catch(console.error);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "open-notes" || tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
});

chrome.runtime.onMessage.addListener((message: FloaterMessage, sender) => {
  if (message.type === "remove-important") {
    removeNoteImportant(message.noteId).catch(console.error);
    return;
  }

  if (sender.tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(console.error);
  if (message.noteId) requestNoteOpen(message.noteId).catch(console.error);
});
