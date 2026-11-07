import { useCallback, useEffect, useState } from "react";
import { readFloaterPreferences, subscribeToFloaterPreferences, updateFloaterPreferences, type FloaterPreferences } from "@/floater/floaterPreferences";
import { notify } from "@/shared/notify";

export function useFloaterPreferences() {
  const [preferences, setPreferences] = useState<FloaterPreferences | null>(null);

  useEffect(() => {
    readFloaterPreferences().then(setPreferences).catch(console.error);
    return subscribeToFloaterPreferences(setPreferences);
  }, []);

  const update = useCallback((change: Partial<FloaterPreferences>) => {
    updateFloaterPreferences(change).catch(() => notify.error("That change isn’t saved. Try again."));
  }, []);

  return { preferences, update };
}
