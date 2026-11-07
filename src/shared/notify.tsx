import { notifications } from "@mantine/notifications";
import type { ReactNode } from "react";
import toastClasses from "./toast.module.css";

type ToastTone = "neutral" | "error";

const UNDO_DURATION_MS = 6000;

function show(message: ReactNode, tone: ToastTone, autoClose: number): string {
  return notifications.show({
    message,
    autoClose,
    withCloseButton: false,
    classNames: {
      root: tone === "error" ? `${toastClasses.toast} ${toastClasses.error}` : toastClasses.toast,
      body: toastClasses.body,
      description: toastClasses.message,
    },
  });
}

export const notify = {
  success: (message: string) => {
    show(message, "neutral", 3000);
  },
  error: (message: string) => {
    show(message, "error", 5000);
  },
  undoable: (message: string, onUndo: () => void) => {
    const toastId: string = show(
      <span className={toastClasses.withAction}>
        {message}
        <button
          type="button"
          className={toastClasses.action}
          onClick={() => {
            notifications.hide(toastId);
            onUndo();
          }}
        >
          Undo
        </button>
      </span>,
      "neutral",
      UNDO_DURATION_MS,
    );
  },
};
