import { Tooltip, UnstyledButton } from "@mantine/core";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import classes from "./iconButton.module.css";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
  tone?: "neutral" | "danger";
  size?: "regular" | "small";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, tone = "neutral", size = "regular", className, ...props },
  ref,
) {
  return (
    <UnstyledButton
      ref={ref}
      component="button"
      type="button"
      aria-label={label}
      className={`${classes.button} ${classes[tone]} ${classes[size]} ${className ?? ""}`}
      {...props}
    />
  );
});

export function IconAction(props: IconButtonProps) {
  return (
    <Tooltip label={props.label} withArrow openDelay={400}>
      <IconButton {...props} />
    </Tooltip>
  );
}
