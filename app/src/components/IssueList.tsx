import { formatUpdatedAt } from "../lib/format-date";
import { issueStatusLabel } from "../lib/issue-status";
import { triageStatusLabel } from "../lib/triage-status";
import type { IssueSummary } from "../types/issue";

type IssueListProps = {
  issues: IssueSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  totalCount: number;
};

export function IssueList({
  issues,
  selectedId,
  onSelect,
  totalCount,
}: IssueListProps) {
  if (totalCount === 0) {
    return (
      <div className="issue-list-empty">
        <p>No issues yet.</p>
        <p>Create one to start tracking work in this workspace.</p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="issue-list-empty">
        <p>No matching issues.</p>
        <p>Try a different search or clear your filters.</p>
      </div>
    );
  }

  return (
    <ul className="issue-list">
      {issues.map((issue) => (
        <li key={issue.id}>
          <button
            type="button"
            className={
              issue.id === selectedId
                ? "issue-list-item issue-list-item-active"
                : "issue-list-item"
            }
            onClick={() => onSelect(issue.id)}
          >
            <div className="issue-list-item-top">
              <span className="issue-id">{issue.id}</span>
              <div className="issue-list-badges">
                <span className={`triage-badge triage-${issue.triage}`}>
                  {triageStatusLabel(issue.triage)}
                </span>
                <span className={`status-badge status-${issue.status}`}>
                  {issueStatusLabel(issue.status)}
                </span>
              </div>
            </div>
            <span className="issue-list-title">{issue.title}</span>
            <span className="issue-list-updated">
              {formatUpdatedAt(issue.updatedAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
