import { UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./listRow.module.css";

type ListRowProps = {
  label: string;
  detail?: ReactNode;
  accessory?: ReactNode;
  onClick?: () => void;
};

function RowContent({ label, detail, accessory }: Omit<ListRowProps, "onClick">) {
  return (
    <>
      <span className={classes.label}>{label}</span>
      {detail !== undefined && <span className={classes.detail}>{detail}</span>}
      {accessory}
    </>
  );
}

export function ListRow({ onClick, ...content }: ListRowProps) {
  if (!onClick) {
    return (
      <div className={classes.row}>
        <RowContent {...content} />
      </div>
    );
  }
  return (
    <UnstyledButton component="button" type="button" className={`${classes.row} ${classes.action}`} onClick={onClick}>
      <RowContent {...content} />
    </UnstyledButton>
  );
}
