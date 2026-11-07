import { UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import classes from "./checkCircle.module.css";

type CheckCircleProps = {
  isChecked: boolean;
  label: string;
  onToggle: () => void;
};

export function CheckCircle({ isChecked, label, onToggle }: CheckCircleProps) {
  return (
    <UnstyledButton component="button" type="button" className={classes.button} aria-label={label} aria-pressed={isChecked} onClick={onToggle}>
      <span className={classes.ring}>
        <Check size={12} strokeWidth={3.2} />
      </span>
    </UnstyledButton>
  );
}
