import { describe, it, expect } from "vitest";
import { describeNoteEditor, type NoteEditorInput } from "../index";

const base: NoteEditorInput = {
  draft: "",
  savedBody: null,
  saving: false,
  error: undefined,
  maxLength: 10,
};

function editor(overrides: Partial<NoteEditorInput>) {
  return describeNoteEditor({ ...base, ...overrides });
}

describe("describeNoteEditor", () => {
  it("is empty and cannot be saved before the Student writes anything", () => {
    expect(editor({})).toEqual({
      length: 0,
      tooLong: false,
      canSave: false,
      status: { kind: "empty" },
    });
  });

  it("cannot save a draft that is only whitespace", () => {
    const state = editor({ draft: "   \n " });
    expect(state.canSave).toBe(false);
    expect(state.length).toBe(0);
    expect(state.status).toEqual({ kind: "empty" });
  });

  it("cannot save a cleared box over an existing Note", () => {
    const state = editor({ draft: "", savedBody: "Generics" });
    expect(state.canSave).toBe(false);
    expect(state.status).toEqual({ kind: "unsaved" });
  });

  it("offers Save for a new draft", () => {
    const state = editor({ draft: "Generics" });
    expect(state.canSave).toBe(true);
    expect(state.length).toBe(8);
    expect(state.status).toEqual({ kind: "unsaved" });
  });

  it("is saved when the draft matches the stored body", () => {
    const state = editor({ draft: "Generics", savedBody: "Generics" });
    expect(state.canSave).toBe(false);
    expect(state.status).toEqual({ kind: "saved" });
  });

  it("ignores surrounding whitespace, which the server trims", () => {
    const state = editor({ draft: "  Generics\n", savedBody: "Generics" });
    expect(state.canSave).toBe(false);
    expect(state.status).toEqual({ kind: "saved" });
  });

  it("has unsaved changes when the draft differs from the stored body", () => {
    const state = editor({ draft: "Generics!", savedBody: "Generics" });
    expect(state.canSave).toBe(true);
    expect(state.status).toEqual({ kind: "unsaved" });
  });

  it("allows a draft exactly at the limit", () => {
    const state = editor({ draft: "x".repeat(10) });
    expect(state.tooLong).toBe(false);
    expect(state.canSave).toBe(true);
  });

  it("blocks a draft over the limit", () => {
    const state = editor({ draft: "x".repeat(11) });
    expect(state).toEqual({
      length: 11,
      tooLong: true,
      canSave: false,
      status: { kind: "too-long" },
    });
  });

  it("is saving while a save is in flight, and cannot save twice", () => {
    const state = editor({ draft: "Generics", saving: true, error: "Nope" });
    expect(state.canSave).toBe(false);
    expect(state.status).toEqual({ kind: "saving" });
  });

  it("shows the error from a failed save", () => {
    const state = editor({ draft: "Generics", error: "Nope" });
    expect(state.status).toEqual({ kind: "error", message: "Nope" });
    expect(state.canSave).toBe(true);
  });

  it("drops a stale error once the draft is saved", () => {
    const state = editor({
      draft: "Generics",
      savedBody: "Generics",
      error: "Nope",
    });
    expect(state.status).toEqual({ kind: "saved" });
  });

  it("reports too long ahead of a stale error", () => {
    const state = editor({ draft: "x".repeat(11), error: "Nope" });
    expect(state.status).toEqual({ kind: "too-long" });
  });
});
