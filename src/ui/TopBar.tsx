import type { ReactNode } from "react";
import classes from "./topBar.module.css";

type TopBarProps = {
  leading: ReactNode;
  title?: string;
  actions?: ReactNode;
};

export function TopBar({ leading, title, actions }: TopBarProps) {
  return (
    <header className={classes.bar}>
      <div className={classes.leading}>{leading}</div>
      {title ? <h1 className={classes.title}>{title}</h1> : <span />}
      <div className={classes.actions}>{actions}</div>
    </header>
  );
}
