export type NoteEditorInput = {
  /** What is in the box right now. */
  draft: string;
  /** The body the server holds, or null when the Student has no Note yet. */
  savedBody: string | null;
  saving: boolean;
  /** The error from the last save, if it failed. */
  error: string | undefined;
  maxLength: number;
};

export type NoteEditorStatus =
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "too-long" }
  | { kind: "unsaved" }
  | { kind: "saved" }
  | { kind: "empty" };

export type NoteEditorState = {
  length: number;
  tooLong: boolean;
  canSave: boolean;
  status: NoteEditorStatus;
};

export function describeNoteEditor(input: NoteEditorInput): NoteEditorState {
  // The server trims before it stores, so surrounding whitespace is not a change.
  const body = input.draft.trim();
  const length = body.length;
  const tooLong = length > input.maxLength;
  const changed = body !== (input.savedBody ?? "");
  const canSave = !input.saving && changed && length > 0 && !tooLong;

  return {
    length,
    tooLong,
    canSave,
    status: statusOf(input, tooLong, changed),
  };
}

function statusOf(
  input: NoteEditorInput,
  tooLong: boolean,
  changed: boolean
): NoteEditorStatus {
  if (input.saving) return { kind: "saving" };
  if (tooLong) return { kind: "too-long" };
  if (input.error && changed) return { kind: "error", message: input.error };
  if (changed) return { kind: "unsaved" };
  if (input.savedBody !== null) return { kind: "saved" };
  return { kind: "empty" };
}
