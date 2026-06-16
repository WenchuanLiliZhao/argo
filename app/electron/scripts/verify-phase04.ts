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

function groupByStatus(
  issues: Array<{ id: string; status: string }>,
): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    backlog: [],
    todo: [],
    "in-progress": [],
    done: [],
  };
  for (const issue of issues) {
    groups[issue.status]?.push(issue.id);
  }
  return groups;
}

async function main(): Promise<void> {
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), "argo-phase04-"));

  try {
    const workspaceService = new WorkspaceService();
    const issueStore = new IssueStore(workspaceService);
    await workspaceService.create(workspacePath, "Phase 04");

    await issueStore.create({ title: "Backlog item", status: "backlog" });
    await issueStore.create({ title: "Todo item", status: "todo" });
    const moving = await issueStore.create({
      title: "Moving item",
      status: "backlog",
    });
    await issueStore.create({ title: "Done item", status: "done" });

    let list = await issueStore.list();
    let grouped = groupByStatus(list);
    await assert(grouped.backlog.length === 2, "two issues start in backlog");
    await assert(grouped.todo.length === 1, "one issue in todo");
    await assert(grouped.done.length === 1, "one issue in done");

    await issueStore.update(moving.id, { status: "in-progress" });
    list = await issueStore.list();
    grouped = groupByStatus(list);
    await assert(
      grouped.backlog.length === 1,
      "moving issue leaves backlog column",
    );
    await assert(
      grouped["in-progress"].includes(moving.id),
      "moving issue appears in in-progress column",
    );
    await assert(
      list.filter((issue) => issue.id === moving.id).length === 1,
      "issue appears exactly once in list",
    );

    console.log("Phase 04 verification passed.");
  } finally {
    await rm(workspacePath, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
