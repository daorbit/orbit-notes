import { UnstyledButton } from "@mantine/core";
import classes from "./segmentedControl.module.css";

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className={classes.control} role="group" aria-label={label}>
      {options.map((option) => (
        <UnstyledButton
          key={option.value}
          component="button"
          type="button"
          className={classes.segment}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </UnstyledButton>
      ))}
    </div>
  );
}
