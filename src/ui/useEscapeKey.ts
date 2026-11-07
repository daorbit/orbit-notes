import { useEffect } from "react";

export function useEscapeKey(onEscape: () => void): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (event.key === "Escape" && !event.isComposing && !isDialogOpen) onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
}
