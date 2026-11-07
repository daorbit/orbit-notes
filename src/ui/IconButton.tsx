import type { ReactNode } from "react";
import styles from "./iconButton.module.css";

type IconButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button type="button" className={styles.button} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}
