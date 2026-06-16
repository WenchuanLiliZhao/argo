import { ISSUE_STATUS_OPTIONS } from "../lib/issue-status";
import type { IssueStatus, IssueSummary } from "../types/issue";

type KanbanCardProps = {
  issue: IssueSummary;
  selected: boolean;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: IssueStatus) => void;
};

export function KanbanCard({
  issue,
  selected,
  onSelect,
  onStatusChange,
}: KanbanCardProps) {
  return (
    <article
      className={
        selected ? "kanban-card kanban-card-active" : "kanban-card"
      }
    >
      <button
        type="button"
        className="kanban-card-main"
        onClick={() => onSelect(issue.id)}
      >
        <span className="issue-id">{issue.id}</span>
        <span className="kanban-card-title">{issue.title}</span>
      </button>
      <label className="kanban-card-status">
        <span className="sr-only">Status for {issue.id}</span>
        <select
          value={issue.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            onStatusChange(issue.id, event.target.value as IssueStatus);
          }}
        >
          {ISSUE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}
