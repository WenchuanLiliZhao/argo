import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { IssueStore } from "../services/issue-store.js";
import { WorkspaceService } from "../services/workspace-service.js";

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), "argo-phase03-"));

  try {
    const workspaceService = new WorkspaceService();
    const issueStore = new IssueStore(workspaceService);
    await workspaceService.create(workspacePath, "Phase 03");

    await issueStore.create({ title: "First" });
    await issueStore.create({ title: "Second" });
    await issueStore.create({ title: "Third" });

    const list = await issueStore.list();
    await assert(list.length === 3, "three issues exist");
    await assert(list[0]?.id === "ARG-3", "list sorts newest first");
    await assert(list[2]?.id === "ARG-1", "list sorts oldest last");

    const descriptionBody = "Shipped";

    await issueStore.update("ARG-2", {
      title: "Updated second",
      status: "done",
      body: descriptionBody,
    });

    const updated = await issueStore.get("ARG-2");
    await assert(updated.title === "Updated second", "title persists");
    await assert(updated.status === "done", "status persists");
    await assert(updated.body.includes("Shipped"), "body persists");

    const filePath = path.join(
      workspacePath,
      ".argo",
      "issues",
      "ARG-2.md",
    );
    const raw = await readFile(filePath, "utf8");
    await assert(raw.includes("status: done"), "status written to frontmatter");

    await issueStore.delete("ARG-1");
    const afterDelete = await issueStore.list();
    await assert(afterDelete.length === 2, "delete removes issue");
    await assert(
      afterDelete.every((issue) => issue.id !== "ARG-1"),
      "deleted id absent from list",
    );

    console.log("Phase 03 verification passed.");
  } finally {
    await rm(workspacePath, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
