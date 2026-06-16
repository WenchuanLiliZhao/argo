import type { Issue, IssueStatus, TriageStatus, UpdateIssuePatch } from "../types/issue";

export type IssueDraft = {
  title: string;
  status: IssueStatus;
  triage: TriageStatus;
  body: string;
};

export function issueDraftFromIssue(issue: Issue): IssueDraft {
  return {
    title: issue.title,
    status: issue.status,
    triage: issue.triage,
    body: issue.body,
  };
}

export function isIssueDraftDirty(issue: Issue, draft: IssueDraft): boolean {
  return (
    draft.title !== issue.title ||
    draft.status !== issue.status ||
    draft.triage !== issue.triage ||
    draft.body !== issue.body
  );
}

export function draftToPatch(draft: IssueDraft): UpdateIssuePatch {
  return {
    title: draft.title,
    status: draft.status,
    triage: draft.triage,
    body: draft.body,
  };
}

export function saveShortcutLabel(): string {
  return navigator.platform.toLowerCase().includes("mac") ? "⌘S" : "Ctrl+S";
}
