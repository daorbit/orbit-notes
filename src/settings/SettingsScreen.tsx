import { ScrollArea } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { BackupMerge } from "@/notes/noteBackup";
import { getDeletedNotes } from "@/notes/noteSelectors";
import type { Note } from "@/notes/types";
import { ActionButton } from "@/ui/ActionButton";
import { BackButton } from "@/ui/BackButton";
import { ListRow } from "@/ui/ListRow";
import { ListSection } from "@/ui/ListSection";
import { Switch } from "@/ui/Switch";
import { TopBar } from "@/ui/TopBar";
import { useEscapeKey } from "@/ui/useEscapeKey";
import { useFloaterPreferences } from "./useFloaterPreferences";
import { useNotesBackup } from "./useNotesBackup";
import classes from "./settingsScreen.module.css";

const COMMAND_NAME = "open-notes";
const SHORTCUTS_PAGE = "chrome://extensions/shortcuts";

type SettingsScreenProps = {
  notes: Note[];
  onBack: () => void;
  onOpenRecentlyDeleted: () => void;
  onImportNotes: (incoming: Note[]) => Promise<BackupMerge>;
};

function useCommandShortcut(): string {
  const [shortcut, setShortcut] = useState("");

  useEffect(() => {
    chrome.commands
      .getAll()
      .then((commands) => setShortcut(commands.find((command) => command.name === COMMAND_NAME)?.shortcut || "Not set"))
      .catch(console.error);
  }, []);

  return shortcut;
}

export function SettingsScreen({ notes, onBack, onOpenRecentlyDeleted, onImportNotes }: SettingsScreenProps) {
  const { preferences, update } = useFloaterPreferences();
  const { exportNotes, importFile } = useNotesBackup(notes, onImportNotes);
  const shortcut = useCommandShortcut();
  const fileInput = useRef<HTMLInputElement>(null);
  const deletedCount = getDeletedNotes(notes).length;

  useEscapeKey(onBack);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void importFile(file);
  };

  return (
    <div className={classes.screen}>
      <TopBar leading={<BackButton label="Notes" onClick={onBack} />} title="Settings" />

      <ScrollArea className={classes.scroll} type="hover" scrollbarSize={6}>
        <ListSection title="Important notes" footer="Important notes float over the web pages you visit, until you mark them as done.">
          <ListRow
            label="Show floating cards"
            accessory={
              preferences && <Switch label="Show floating cards" isOn={preferences.isEnabled} onChange={(isEnabled) => update({ isEnabled })} />
            }
          />
        </ListSection>

        {preferences && preferences.hiddenSites.length > 0 && (
          <ListSection title="Hidden on these sites">
            {preferences.hiddenSites.map((site) => (
              <ListRow
                key={site}
                label={site}
                accessory={
                  <ActionButton
                    variant="plain"
                    className={classes.rowAction}
                    aria-label={`Show cards on ${site}`}
                    onClick={() => update({ hiddenSites: preferences.hiddenSites.filter((hidden) => hidden !== site) })}
                  >
                    Show
                  </ActionButton>
                }
              />
            ))}
          </ListSection>
        )}

        <ListSection title="Your notes" footer="Notes stay on this device. Export a backup to keep a copy or move them to another browser.">
          <ListRow label="Recently deleted" detail={deletedCount} accessory={<ChevronRight size={15} className={classes.chevron} />} onClick={onOpenRecentlyDeleted} />
          <ListRow label="Export backup" onClick={exportNotes} />
          <ListRow label="Import backup" onClick={() => fileInput.current?.click()} />
        </ListSection>
        <input ref={fileInput} className={classes.fileInput} type="file" accept=".json,application/json" aria-label="Backup file" onChange={handleFileChange} />

        <ListSection title="About">
          <ListRow
            label="Open with keyboard"
            detail={shortcut}
            accessory={
              <ActionButton variant="plain" className={classes.rowAction} onClick={() => void chrome.tabs.create({ url: SHORTCUTS_PAGE })}>
                Change
              </ActionButton>
            }
          />
          <ListRow label="Version" detail={chrome.runtime.getManifest().version} />
        </ListSection>
      </ScrollArea>
    </div>
  );
}
