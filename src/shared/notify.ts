import { notifications } from "@mantine/notifications";
import toastClasses from "./toast.module.css";

type ToastTone = "neutral" | "error";

function show(message: string, tone: ToastTone, autoClose: number) {
  notifications.show({
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
  success: (message: string) => show(message, "neutral", 3000),
  error: (message: string) => show(message, "error", 5000),
};
