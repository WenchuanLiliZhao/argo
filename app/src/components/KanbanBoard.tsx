import { groupIssuesByColumn } from "../lib/group-issues";
import { issueStatusLabel } from "../lib/issue-status";
import { KanbanCard } from "./KanbanCard";
import type { IssueStatus, IssueSummary } from "../types/issue";

type KanbanBoardProps = {
  columns: IssueStatus[];
  issues: IssueSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: IssueStatus) => void;
};

export function KanbanBoard({
  columns,
  issues,
  selectedId,
  onSelect,
  onStatusChange,
}: KanbanBoardProps) {
  const grouped = groupIssuesByColumn(issues, columns);

  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnIssues = grouped[column];
        return (
          <section key={column} className="kanban-column">
            <header className="kanban-column-header">
              <h3>{issueStatusLabel(column)}</h3>
              <span className="kanban-column-count">{columnIssues.length}</span>
            </header>
            <div className="kanban-column-cards">
              {columnIssues.length === 0 ? (
                <p className="kanban-column-empty">No issues</p>
              ) : (
                columnIssues.map((issue) => (
                  <KanbanCard
                    key={issue.id}
                    issue={issue}
                    selected={issue.id === selectedId}
                    onSelect={onSelect}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
