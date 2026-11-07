import { Menu } from "@mantine/core";
import { Ellipsis, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { IconButton } from "@/ui/IconButton";
import classes from "./noteRowMenu.module.css";

type NoteRowMenuProps = {
  title: string;
  isPinned: boolean;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
};

export function NoteRowMenu({ title, isPinned, onEdit, onTogglePin, onDelete }: NoteRowMenuProps) {
  return (
    <Menu
      position="bottom-end"
      width={150}
      offset={4}
      transitionProps={{ duration: 0 }}
      classNames={{ dropdown: classes.dropdown, item: classes.item, itemSection: classes.itemSection, divider: classes.divider }}
    >
      <Menu.Target>
        <IconButton label={`More actions for ${title}`} size="small">
          <Ellipsis size={15} />
        </IconButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>
          Edit
        </Menu.Item>
        <Menu.Item leftSection={isPinned ? <PinOff size={14} /> : <Pin size={14} />} onClick={onTogglePin}>
          {isPinned ? "Unpin" : "Pin"}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item className={classes.danger} leftSection={<Trash2 size={14} />} onClick={onDelete}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
