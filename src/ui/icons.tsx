import styles from "./icons.module.css";

export function CloseIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
    </svg>
  );
}
