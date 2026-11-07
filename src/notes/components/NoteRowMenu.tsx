import { Menu } from "@mantine/core";
import { CircleCheck, CircleDashed, Ellipsis, Flag, FlagOff, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { IconButton } from "@/ui/IconButton";
import { isDone } from "../noteSelectors";
import type { Note } from "../types";
import type { NoteActions } from "../useNoteActions";
import classes from "./noteRowMenu.module.css";

type NoteRowMenuProps = {
  note: Note;
  title: string;
  actions: NoteActions;
  onEdit: () => void;
};

export function NoteRowMenu({ note, title, actions, onEdit }: NoteRowMenuProps) {
  const noteIsDone = isDone(note);

  return (
    <Menu
      position="bottom-end"
      width={188}
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
        <Menu.Item leftSection={noteIsDone ? <CircleDashed size={14} /> : <CircleCheck size={14} />} onClick={() => actions.toggleDone(note)}>
          {noteIsDone ? "Mark as not done" : "Mark as done"}
        </Menu.Item>
        {!noteIsDone && (
          <Menu.Item leftSection={note.important ? <FlagOff size={14} /> : <Flag size={14} />} onClick={() => actions.toggleImportant(note)}>
            {note.important ? "Remove from tabs" : "Mark as important"}
          </Menu.Item>
        )}
        <Menu.Item leftSection={note.pinned ? <PinOff size={14} /> : <Pin size={14} />} onClick={() => actions.togglePin(note)}>
          {note.pinned ? "Unpin" : "Pin"}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item className={classes.danger} leftSection={<Trash2 size={14} />} onClick={() => actions.moveToTrash(note)}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
