import type { IssueStatus, IssueSummary, TriageStatus } from "../types/issue";

export type IssueFilterState = {
  query: string;
  statuses: IssueStatus[];
  triages: TriageStatus[];
  labels: string[];
};

export function filterIssues(
  issues: IssueSummary[],
  filters: IssueFilterState,
): IssueSummary[] {
  const query = filters.query.trim().toLowerCase();

  return issues.filter((issue) => {
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(issue.status)
    ) {
      return false;
    }

    if (
      filters.labels.length > 0 &&
      !issue.labels.some((label) => filters.labels.includes(label))
    ) {
      return false;
    }

    if (
      filters.triages.length > 0 &&
      !filters.triages.includes(issue.triage)
    ) {
      return false;
    }

    if (query) {
      const haystack = `${issue.title}\n${issue.body}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function collectLabels(issues: IssueSummary[]): string[] {
  const labels = new Set<string>();
  for (const issue of issues) {
    for (const label of issue.labels) {
      labels.add(label);
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b));
}

export function hasActiveFilters(filters: IssueFilterState): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.statuses.length > 0 ||
    filters.triages.length > 0 ||
    filters.labels.length > 0
  );
}
