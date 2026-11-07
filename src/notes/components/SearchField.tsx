import { Search, X } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/ui/IconButton";
import classes from "./searchField.module.css";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ value, onChange }: SearchFieldProps) {
  const input = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    input.current?.focus();
  };

  return (
    <div className={classes.field}>
      <Search size={14} aria-hidden="true" className={classes.icon} />
      <input
        ref={input}
        className={classes.input}
        type="search"
        aria-label="Search notes"
        placeholder="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <IconButton label="Clear search" size="small" onClick={handleClear}>
          <X size={13} />
        </IconButton>
      )}
    </div>
  );
}
