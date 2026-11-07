export type FloaterMessage =
  | { type: "open-panel"; noteId?: string }
  | { type: "remove-important"; noteId: string };
