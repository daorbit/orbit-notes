import contentScript from "../content/index.ts?iife";
import { DRAWER_PAGE_PATH } from "@/shared/drawer";

async function isShowingNotesPage(tabId: number): Promise<boolean> {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.TAB],
    tabIds: [tabId],
    frameIds: [0],
  });
  return contexts.length > 0;
}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined || (await isShowingNotesPage(tab.id))) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentScript],
    });
  } catch {
    await chrome.tabs.create({ url: chrome.runtime.getURL(DRAWER_PAGE_PATH) });
  }
});
