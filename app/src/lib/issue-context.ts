import type { Issue } from "../types/issue";

export function formatIssueContext(issue: Issue): string {
  return `# ${issue.id}: ${issue.title}\nStatus: ${issue.status} | Triage: ${issue.triage}\n\n${issue.body}`;
}
