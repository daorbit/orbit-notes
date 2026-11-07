import type { ReactNode } from "react";
import classes from "./listSection.module.css";

type ListSectionProps = {
  title: string;
  footer?: string;
  children: ReactNode;
};

export function ListSection({ title, footer, children }: ListSectionProps) {
  return (
    <section className={classes.section} aria-label={title}>
      <h2 className={classes.title}>{title}</h2>
      <div className={classes.group}>{children}</div>
      {footer && <p className={classes.footer}>{footer}</p>}
    </section>
  );
}
