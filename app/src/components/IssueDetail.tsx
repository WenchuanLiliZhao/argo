import { useCallback, useEffect, useState } from "react";
import {
  draftToPatch,
  isIssueDraftDirty,
  issueDraftFromIssue,
  saveShortcutLabel,
} from "../lib/issue-draft";
import { formatIssueContext } from "../lib/issue-context";
import { ISSUE_STATUS_OPTIONS } from "../lib/issue-status";
import { TRIAGE_STATUS_OPTIONS } from "../lib/triage-status";
import type { Issue, IssueStatus, TriageStatus, UpdateIssuePatch } from "../types/issue";

type IssueDetailProps = {
  issue: Issue;
  saving: boolean;
  onUpdate: (patch: UpdateIssuePatch) => Promise<void>;
  onDelete: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export function IssueDetail({
  issue,
  saving,
  onUpdate,
  onDelete,
  onDirtyChange,
}: IssueDetailProps) {
  const [draft, setDraft] = useState(() => issueDraftFromIssue(issue));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const isDirty = isIssueDraftDirty(issue, draft);
  const shortcut = saveShortcutLabel();

  useEffect(() => {
    setDraft(issueDraftFromIssue(issue));
    setCopyState("idle");
  }, [issue.id, issue.updatedAt]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = useCallback(async () => {
    if (!isIssueDraftDirty(issue, draft) || saving) {
      return;
    }
    await onUpdate(draftToPatch(draft));
  }, [draft, issue, onUpdate, saving]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  const handleCopyContext = async () => {
    try {
      const contextIssue: Issue = {
        ...issue,
        ...draft,
        createdAt: issue.createdAt,
      };
      await navigator.clipboard.writeText(formatIssueContext(contextIssue));
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <section className="issue-detail">
      <div className="issue-detail-header">
        <span className="issue-detail-id">{issue.id}</span>
        <div className="issue-detail-actions">
          <button
            type="button"
            className={isDirty ? "primary" : "save-button-idle"}
            disabled={!isDirty || saving}
            onClick={() => void handleSave()}
            title={isDirty ? `Save (${shortcut})` : "No unsaved changes"}
          >
            {saving ? "Saving…" : isDirty ? "Save" : "Saved"}
          </button>
          <span className="save-shortcut" aria-hidden="true">
            {shortcut}
          </span>
          <button type="button" onClick={() => void handleCopyContext()}>
            Copy context
          </button>
          <button type="button" className="danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      {isDirty ? (
        <p className="issue-unsaved-hint">Unsaved changes</p>
      ) : null}

      {copyState === "copied" ? (
        <p className="issue-copy-feedback">Issue context copied to clipboard.</p>
      ) : null}
      {copyState === "error" ? (
        <p className="issue-copy-feedback issue-copy-error">
          Could not copy to clipboard.
        </p>
      ) : null}

      <label className="field">
        <span className="field-label">Title</span>
        <input
          className="field-input"
          value={draft.title}
          onChange={(event) => {
            setDraft((current) => ({ ...current, title: event.target.value }));
          }}
        />
      </label>

      <div className="issue-detail-row">
        <label className="field">
          <span className="field-label">Status</span>
          <select
            className="field-input"
            value={draft.status}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                status: event.target.value as IssueStatus,
              }));
            }}
          >
            {ISSUE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Triage</span>
          <select
            className="field-input"
            value={draft.triage}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                triage: event.target.value as TriageStatus,
              }));
            }}
          >
            {TRIAGE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field field-grow">
        <span className="field-label">Description</span>
        <textarea
          className="field-textarea"
          value={draft.body}
          onChange={(event) => {
            setDraft((current) => ({ ...current, body: event.target.value }));
          }}
          placeholder="Add details for this issue…"
          spellCheck={true}
        />
      </label>

      <p className="issue-help">
        Description is saved as the issue file body. Save with <kbd>{shortcut}</kbd>.
      </p>
    </section>
  );
}
