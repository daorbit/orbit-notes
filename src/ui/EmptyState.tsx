import type { ReactNode } from "react";
import classes from "./emptyState.module.css";

type EmptyStateProps = {
  showIcon?: boolean;
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ showIcon = false, title, message, action }: EmptyStateProps) {
  return (
    <div className={classes.state}>
      {showIcon && <img className={classes.icon} src="/icons/icon.svg" alt="" />}
      <h2 className={classes.title}>{title}</h2>
      <p className={classes.message}>{message}</p>
      {action}
    </div>
  );
}
