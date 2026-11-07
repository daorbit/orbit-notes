import { NoteEditor } from "@/notes/NoteEditor";
import { IconButton } from "@/ui/IconButton";
import { CloseIcon } from "@/ui/icons";
import styles from "./app.module.css";
import { closeDrawer, isEmbedded } from "./embedding";
import { useEscapeKey } from "./useEscapeKey";

export function App() {
  useEscapeKey(closeDrawer);

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        {isEmbedded && (
          <IconButton label="Close" onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        )}
      </header>
      <NoteEditor />
    </main>
  );
}
