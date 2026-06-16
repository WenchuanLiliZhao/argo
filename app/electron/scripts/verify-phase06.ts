import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DEFAULT_ISSUE_BODY } from "../shared/issue-template.js";
import { IssueStore } from "../services/issue-store.js";
import { WorkspaceService } from "../services/workspace-service.js";

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), "argo-phase06-"));

  try {
    await assert(DEFAULT_ISSUE_BODY === "", "default body is empty");

    const workspaceService = new WorkspaceService();
    const issueStore = new IssueStore(workspaceService);
    await workspaceService.create(workspacePath, "Phase 06");

    const created = await issueStore.create({ title: "Agent ready task" });
    await assert(created.body === "", "new issue has empty body");

    const updatedTriage = await issueStore.update(created.id, {
      triage: "ready-for-agent",
    });
    await assert(
      updatedTriage.triage === "ready-for-agent",
      "triage persists to frontmatter",
    );

    const withDescription = await issueStore.update(created.id, {
      body: "Implement workspace picker UI",
    });
    await assert(
      withDescription.body === "Implement workspace picker UI",
      "description persists as body",
    );

    const context = `# ${withDescription.id}: ${withDescription.title}\nStatus: ${withDescription.status} | Triage: ${withDescription.triage}\n\n${withDescription.body}`;
    await assert(context.includes("Implement workspace picker UI"), "context includes body");

    const list = await issueStore.list();
    await assert(
      list.filter((issue) => issue.triage === "ready-for-agent").length === 1,
      "ready-for-agent issue appears in list",
    );

    console.log("Phase 06 verification passed.");
  } finally {
    await rm(workspacePath, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
