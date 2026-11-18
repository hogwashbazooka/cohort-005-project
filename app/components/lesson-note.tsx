import { useState } from "react";
import { useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import { MAX_NOTE_LENGTH } from "~/lib/notes";
import {
  describeNoteEditor,
  type NoteEditorStatus,
} from "~/modules/note-editor";

type SavedNote = { body: string; updatedAt: string } | null;

/**
 * The Student's private Note on a Lesson. Styled as a sibling of the
 * Questions & Discussion card, so the two read as one family of panels.
 */
export function LessonNote({ note }: { note: SavedNote }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [draft, setDraft] = useState(note?.body ?? "");

  const editor = describeNoteEditor({
    draft,
    savedBody: note?.body ?? null,
    saving: fetcher.state !== "idle",
    error: fetcher.data?.error,
    maxLength: MAX_NOTE_LENGTH,
  });

  return (
    <Card className="mb-8 py-0">
      <CardContent className="p-6">
        <NoteHeading />

        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            placeholder="Jot down what clicked, what to revisit, or a question to ask later..."
            aria-label="Your notes on this lesson"
            className="min-h-28 resize-y"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={!editor.canSave}>
              {editor.status.kind === "saving" ? "Saving..." : "Save note"}
            </Button>
            <NoteStatus status={editor.status} updatedAt={note?.updatedAt} />
            <span
              className={cn(
                "ml-auto text-xs",
                editor.tooLong ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {editor.length} / {MAX_NOTE_LENGTH}
            </span>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteHeading() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <NotebookPen className="size-5 text-primary" />
      <h2 className="text-xl font-semibold">Your notes</h2>
      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Lock className="size-3" />
        Only you can see these
      </span>
    </div>
  );
}

function NoteStatus({
  status,
  updatedAt,
}: {
  status: NoteEditorStatus;
  updatedAt: string | undefined;
}) {
  switch (status.kind) {
    case "error":
      return (
        <span role="alert" className="text-xs text-destructive">
          {status.message}
        </span>
      );
    case "too-long":
      return (
        <span className="text-xs text-destructive">
          Too long to save — trim it down a little.
        </span>
      );
    case "unsaved":
      return (
        <span className="text-xs text-muted-foreground">Unsaved changes</span>
      );
    case "saved":
      return (
        <span
          suppressHydrationWarning
          className="text-xs text-muted-foreground"
        >
          Saved{updatedAt ? ` ${formatRelativeTime(updatedAt)}` : ""}
        </span>
      );
    default:
      return null;
  }
}
