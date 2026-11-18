import { describeNoteEditor as describe } from "./lib/status";
import type { NoteEditorInput, NoteEditorState } from "./lib/status";

export type {
  NoteEditorInput,
  NoteEditorState,
  NoteEditorStatus,
} from "./lib/status";

/**
 * What the Lesson Note editor shows for a draft: its length against the limit,
 * whether Save is enabled, and one status — saving, an error, too long,
 * unsaved changes, saved, or empty.
 */
export function describeNoteEditor(input: NoteEditorInput): NoteEditorState {
  return describe(input);
}
