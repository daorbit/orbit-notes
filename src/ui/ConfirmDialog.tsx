import { Modal } from "@mantine/core";
import { ActionButton } from "./ActionButton";
import classes from "./confirmDialog.module.css";

type ConfirmDialogProps = {
  opened: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ opened, title, message, cancelLabel, confirmLabel, isBusy = false, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal
      opened={opened}
      onClose={() => !isBusy && onCancel()}
      withCloseButton={false}
      centered
      size={300}
      padding={0}
      overlayProps={{ backgroundOpacity: 0.4 }}
      transitionProps={{ duration: 120, transition: "fade" }}
      classNames={{ content: classes.content, body: classes.body }}
      aria-label={title}
    >
      <h2 className={classes.title}>{title}</h2>
      <p className={classes.message}>{message}</p>
      <div className={classes.actions}>
        <ActionButton variant="neutral" className={classes.action} disabled={isBusy} onClick={onCancel}>
          {cancelLabel}
        </ActionButton>
        <ActionButton variant="destructive" className={classes.action} disabled={isBusy} onClick={onConfirm}>
          {confirmLabel}
        </ActionButton>
      </div>
    </Modal>
  );
}
