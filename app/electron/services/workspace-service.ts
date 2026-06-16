import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ArgoError, rethrowAsArgoError } from "../shared/errors.js";
import { parseWorkspaceMeta } from "../shared/parsers.js";
import type { WorkspaceMeta } from "../shared/types.js";

const ARGO_DIR = ".argo";
const WORKSPACE_FILE = "workspace.json";
const ISSUES_DIR = "issues";

const DEFAULT_COLUMNS = [
  "backlog",
  "todo",
  "in-progress",
  "done",
] as const;

type OpenWorkspace = {
  rootPath: string;
  meta: WorkspaceMeta;
};

export class WorkspaceService {
  private current: OpenWorkspace | null = null;

  getArgoDir(rootPath: string): string {
    return path.join(rootPath, ARGO_DIR);
  }

  getIssuesDir(rootPath: string): string {
    return path.join(this.getArgoDir(rootPath), ISSUES_DIR);
  }

  getWorkspaceFile(rootPath: string): string {
    return path.join(this.getArgoDir(rootPath), WORKSPACE_FILE);
  }

  getCurrent(): WorkspaceMeta | null {
    return this.current?.meta ?? null;
  }

  getCurrentPath(): string | null {
    return this.current?.rootPath ?? null;
  }

  requireOpen(): OpenWorkspace {
    if (!this.current) {
      throw new ArgoError(
        "NO_WORKSPACE_OPEN",
        "No workspace is open. Call workspace.open() or workspace.create() first.",
      );
    }
    return this.current;
  }

  async create(workspacePath: string, name: string): Promise<WorkspaceMeta> {
    await this.assertDirectory(workspacePath);

    const argoDir = this.getArgoDir(workspacePath);
    if (await this.pathExists(argoDir)) {
      throw new ArgoError(
        "WORKSPACE_INVALID",
        `Workspace already exists at ${argoDir}`,
      );
    }

    const now = new Date().toISOString();
    const meta: WorkspaceMeta = {
      version: 1,
      name,
      issuePrefix: "ARG",
      nextIssueNumber: 1,
      columns: [...DEFAULT_COLUMNS],
      createdAt: now,
      openedAt: now,
    };

    try {
      await mkdir(this.getIssuesDir(workspacePath), { recursive: true });
      await writeFile(
        this.getWorkspaceFile(workspacePath),
        `${JSON.stringify(meta, null, 2)}\n`,
        "utf8",
      );
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to create workspace at ${workspacePath}`,
      );
    }

    this.current = { rootPath: workspacePath, meta };
    return meta;
  }

  async open(workspacePath: string): Promise<WorkspaceMeta> {
    await this.assertDirectory(workspacePath);

    const argoDir = this.getArgoDir(workspacePath);
    if (!(await this.pathExists(argoDir))) {
      throw new ArgoError(
        "WORKSPACE_NOT_FOUND",
        `No .argo directory found at ${workspacePath}`,
      );
    }

    let raw: string;
    try {
      raw = await readFile(this.getWorkspaceFile(workspacePath), "utf8");
    } catch (err) {
      rethrowAsArgoError(
        err,
        "WORKSPACE_NOT_FOUND",
        `Missing or unreadable workspace.json in ${argoDir}`,
      );
    }

    let parsed: WorkspaceMeta;
    try {
      parsed = parseWorkspaceMeta(JSON.parse(raw));
    } catch (err) {
      rethrowAsArgoError(
        err,
        "WORKSPACE_INVALID",
        `Invalid workspace.json in ${argoDir}`,
      );
    }

    const meta: WorkspaceMeta = {
      ...parsed,
      openedAt: new Date().toISOString(),
    };

    try {
      await writeFile(
        this.getWorkspaceFile(workspacePath),
        `${JSON.stringify(meta, null, 2)}\n`,
        "utf8",
      );
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to update openedAt in workspace.json`,
      );
    }

    this.current = { rootPath: workspacePath, meta };
    return meta;
  }

  async persistMeta(): Promise<void> {
    const open = this.requireOpen();
    try {
      await writeFile(
        this.getWorkspaceFile(open.rootPath),
        `${JSON.stringify(open.meta, null, 2)}\n`,
        "utf8",
      );
    } catch (err) {
      rethrowAsArgoError(err, "IO_ERROR", "Failed to write workspace.json");
    }
  }

  private async assertDirectory(workspacePath: string): Promise<void> {
    try {
      const info = await stat(workspacePath);
      if (!info.isDirectory()) {
        throw new ArgoError(
          "WORKSPACE_INVALID",
          `Path is not a directory: ${workspacePath}`,
        );
      }
    } catch (err) {
      if (err instanceof ArgoError) {
        throw err;
      }
      rethrowAsArgoError(
        err,
        "WORKSPACE_INVALID",
        `Path does not exist or is not accessible: ${workspacePath}`,
      );
    }
  }

  private async pathExists(targetPath: string): Promise<boolean> {
    try {
      await access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
