import classes from "./switch.module.css";

type SwitchProps = {
  label: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
};

export function Switch({ label, isOn, onChange }: SwitchProps) {
  return (
    <label className={classes.switch}>
      <input
        className={classes.input}
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={isOn}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={classes.track} />
    </label>
  );
}
