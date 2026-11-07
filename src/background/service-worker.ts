import { removeExpiredNotes } from "@/notes/noteSelectors";
import { updateNotes, updateNoteState } from "@/notes/noteStorage";
import { isWebUrl } from "@/notes/noteValidation";
import { sendPanelRequest } from "@/notes/panelRequest";
import type { FloaterMessage } from "@/shared/messages";

const CAPTURE_SELECTION_MENU = "capture-selection";
const CAPTURE_PAGE_MENU = "capture-page";

async function showFloatersInOpenTabs(): Promise<void> {
  const files = chrome.runtime.getManifest().content_scripts?.[0]?.js;
  if (!files) return;
  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  await Promise.allSettled(
    tabs.map((tab) => (tab.id === undefined ? undefined : chrome.scripting.executeScript({ target: { tabId: tab.id }, files }))),
  );
}

function purgeExpiredNotes(): void {
  updateNotes((notes) => removeExpiredNotes(notes, Date.now())).catch(console.error);
}

function createCaptureMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: CAPTURE_SELECTION_MENU, title: "Add selection to Orbit Notes", contexts: ["selection"] });
    chrome.contextMenus.create({ id: CAPTURE_PAGE_MENU, title: "Add this page to Orbit Notes", contexts: ["page"] });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
  createCaptureMenus();
  purgeExpiredNotes();
  showFloatersInOpenTabs().catch(console.error);
});

chrome.runtime.onStartup.addListener(purgeExpiredNotes);

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "open-notes" || tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);

  const source = tab.url && isWebUrl(tab.url) ? { url: tab.url, title: tab.title ?? "" } : undefined;
  const values =
    info.menuItemId === CAPTURE_SELECTION_MENU ? { title: "", body: info.selectionText ?? "" } : { title: tab.title ?? "", body: "" };
  sendPanelRequest({ type: "capture", values, source }).catch(console.error);
});

chrome.runtime.onMessage.addListener((message: FloaterMessage, sender, sendResponse) => {
  if (message.type === "update-note") {
    updateNoteState(message.noteId, message.change).then(
      () => sendResponse(true),
      (error: unknown) => {
        console.error(error);
        sendResponse(false);
      },
    );
    return true;
  }

  if (sender.tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(console.error);
  sendPanelRequest({ type: "open-note", noteId: message.noteId }).catch(console.error);
});
