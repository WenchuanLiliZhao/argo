import type { IssueStatus } from "../types/issue";

export const ISSUE_STATUS_OPTIONS: Array<{
  value: IssueStatus;
  label: string;
}> = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function issueStatusLabel(status: IssueStatus): string {
  return (
    ISSUE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}
