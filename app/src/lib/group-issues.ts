import { sortIssuesDescending } from "./issue-body";
import type { IssueStatus, IssueSummary } from "../types/issue";

export function groupIssuesByColumn(
  issues: IssueSummary[],
  columns: IssueStatus[],
): Record<IssueStatus, IssueSummary[]> {
  const grouped = Object.fromEntries(
    columns.map((column) => [column, [] as IssueSummary[]]),
  ) as Record<IssueStatus, IssueSummary[]>;

  for (const issue of issues) {
    if (grouped[issue.status]) {
      grouped[issue.status].push(issue);
    }
  }

  for (const column of columns) {
    grouped[column] = sortIssuesDescending(grouped[column]);
  }

  return grouped;
}
