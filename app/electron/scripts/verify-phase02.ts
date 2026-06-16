import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RecentWorkspaceStore } from "../services/recent-workspace-store.js";

async function assert(condition: boolean, message: string): Promise<void> {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "argo-phase02-"));

  try {
    const store = RecentWorkspaceStore.forUserData(userDataDir);

    await assert((await store.getRecent()) === null, "recent path starts null");

    await store.setRecent("/tmp/my-workspace");
    await assert(
      (await store.getRecent()) === "/tmp/my-workspace",
      "recent path persists after set",
    );

    const settingsPath = path.join(userDataDir, "argo-settings.json");
    const raw = await readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as { lastWorkspacePath: string };
    await assert(
      parsed.lastWorkspacePath === "/tmp/my-workspace",
      "settings file stores lastWorkspacePath in userData",
    );

    await store.setRecent(null);
    await assert(
      (await store.getRecent()) === null,
      "recent path clears after setRecent(null)",
    );

    console.log("Phase 02 verification passed.");
  } finally {
    await rm(userDataDir, { recursive: true, force: true });
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
