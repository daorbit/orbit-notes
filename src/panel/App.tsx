import styles from "./app.module.css";

export function App() {
  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Orbit Notes</h1>
      <p className={styles.hint}>Your notes will live here.</p>
    </main>
  );
}
