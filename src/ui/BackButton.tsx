import { ChevronLeft } from "lucide-react";
import { ActionButton } from "./ActionButton";
import classes from "./backButton.module.css";

type BackButtonProps = {
  label: string;
  onClick: () => void;
};

export function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <ActionButton variant="plain" className={classes.back} onClick={onClick}>
      <ChevronLeft size={17} />
      {label}
    </ActionButton>
  );
}
