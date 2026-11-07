import { UnstyledButton } from "@mantine/core";
import type { ComponentPropsWithoutRef } from "react";
import classes from "./actionButton.module.css";

type ActionButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "prominent" | "neutral" | "plain" | "destructive";
};

export function ActionButton({ variant = "prominent", className, ...props }: ActionButtonProps) {
  return <UnstyledButton component="button" type="button" className={`${classes.button} ${classes[variant]} ${className ?? ""}`} {...props} />;
}
