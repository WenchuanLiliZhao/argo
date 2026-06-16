import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { IssueStore } from "../services/issue-store.js";
import { WorkspaceService } from "../services/workspace-service.js";

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

type IssueRow = {
  id: string;
  title: string;
  status: string;
  labels: string[];
  body: string;
};

function filterIssues(
  issues: IssueRow[],
  filters: { query: string; statuses: string[]; labels: string[] },
): IssueRow[] {
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
    if (query) {
      const haystack = `${issue.title}\n${issue.body}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

async function main(): Promise<void> {
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), "argo-phase05-"));

  try {
    const workspaceService = new WorkspaceService();
    const issueStore = new IssueStore(workspaceService);
    await workspaceService.create(workspacePath, "Phase 05");

    await issueStore.create({
      title: "Alpha unique-token",
      status: "backlog",
      labels: ["bug"],
      body: "visible in description",
    });
    await issueStore.create({
      title: "Beta task",
      status: "todo",
      labels: ["enhancement"],
    });
    await issueStore.create({
      title: "Gamma",
      status: "in-progress",
      labels: ["enhancement", "bug"],
    });
    await issueStore.create({
      title: "Delta",
      status: "done",
      labels: [],
    });

    const list = await issueStore.list();
    const rows: IssueRow[] = list.map((issue) => ({
      id: issue.id,
      title: issue.title,
      status: issue.status,
      labels: issue.labels,
      body: issue.body,
    }));

    await assert(
      filterIssues(rows, { query: "unique-token", statuses: [], labels: [] })
        .length === 1,
      "search matches title",
    );
    await assert(
      filterIssues(rows, { query: "visible in description", statuses: [], labels: [] })
        .length === 1,
      "search matches description body",
    );
    await assert(
      filterIssues(rows, { query: "", statuses: ["todo", "done"], labels: [] })
        .length === 2,
      "multi-status filter uses OR",
    );
    await assert(
      filterIssues(rows, { query: "", statuses: [], labels: ["enhancement"] })
        .length === 2,
      "label filter matches any selected label",
    );
    await assert(
      filterIssues(rows, {
        query: "beta",
        statuses: ["todo"],
        labels: [],
      }).length === 1,
      "search and status combine with AND",
    );
    await assert(
      filterIssues(rows, { query: "", statuses: [], labels: [] }).length === 4,
      "clear filters returns all issues",
    );
    await assert(
      filterIssues(rows, { query: "missing-term-xyz", statuses: [], labels: [] })
        .length === 0,
      "no matches returns empty list",
    );

    console.log("Phase 05 verification passed.");
  } finally {
    await rm(workspacePath, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
