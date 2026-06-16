import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ArgoError } from "../shared/errors.js";
import { IssueStore } from "../services/issue-store.js";
import { WorkspaceService } from "../services/workspace-service.js";

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertRejects(
  fn: () => Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await fn();
    throw new Error(`Expected rejection with code ${code}`);
  } catch (err) {
    if (!(err instanceof ArgoError) || err.code !== code) {
      throw err;
    }
  }
}

async function main(): Promise<void> {
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), "argo-phase01-"));

  try {
    const workspaceService = new WorkspaceService();
    const issueStore = new IssueStore(workspaceService);

    await assertRejects(
      () => workspaceService.open(workspacePath),
      "WORKSPACE_NOT_FOUND",
    );

    const created = await workspaceService.create(workspacePath, "Test");
    await assert(created.version === 1, "workspace version should be 1");
    await assert(created.nextIssueNumber === 1, "nextIssueNumber should start at 1");

    await assertRejects(
      () => workspaceService.create(workspacePath, "Duplicate"),
      "WORKSPACE_INVALID",
    );

    workspaceService.getCurrent();
    await workspaceService.open(workspacePath);
    const current = workspaceService.getCurrent();
    await assert(current?.name === "Test", "getCurrent should return workspace meta");

    const issue1 = await issueStore.create({ title: "First issue" });
    await assert(issue1.id === "ARG-1", "first issue id should be ARG-1");

    const issue2 = await issueStore.create({ title: "Second issue" });
    await assert(issue2.id === "ARG-2", "second issue id should be ARG-2");

    const list = await issueStore.list();
    await assert(list.length === 2, "list should contain 2 issues");
    await assert(list[0]?.id === "ARG-2", "list should sort by id descending");
    await assert(list[1]?.id === "ARG-1", "list should sort by id descending");

    const updated = await issueStore.update("ARG-1", {
      title: "Updated title",
      status: "in-progress",
    });
    await assert(updated.title === "Updated title", "title should update");
    await assert(updated.status === "in-progress", "status should update");
    await assert(
      updated.updatedAt !== issue1.updatedAt,
      "updatedAt should change",
    );

    await issueStore.delete("ARG-2");
    const afterDelete = await issueStore.list();
    await assert(afterDelete.length === 1, "delete should remove issue");
    await assert(afterDelete[0]?.id === "ARG-1", "ARG-1 should remain");

    const reopened = new WorkspaceService();
    const reopenedStore = new IssueStore(reopened);
    await reopened.open(workspacePath);
    const persisted = await reopenedStore.list();
    await assert(persisted.length === 1, "persisted list length should be 1");
    await assert(
      persisted[0]?.title === "Updated title",
      "persisted title should match",
    );
    await assert(
      reopened.getCurrent()?.nextIssueNumber === 3,
      "nextIssueNumber should persist as 3",
    );

    console.log("Phase 01 verification passed.");
  } finally {
    await rm(workspacePath, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
