chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "open-notes" || tab?.windowId === undefined) return;
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
});
