import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ArgoError, rethrowAsArgoError } from "../shared/errors.js";
import {
  issueNumberFromId,
  parseIssueFile,
  serializeIssue,
} from "../shared/issue-file.js";
import type {
  CreateIssueInput,
  Issue,
  IssueSummary,
  UpdateIssuePatch,
} from "../shared/types.js";
import { DEFAULT_ISSUE_BODY } from "../shared/issue-template.js";
import type { WorkspaceService } from "./workspace-service.js";

export class IssueStore {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async list(): Promise<IssueSummary[]> {
    const { rootPath } = this.workspaceService.requireOpen();
    const issuesDir = this.workspaceService.getIssuesDir(rootPath);

    let entries: string[];
    try {
      entries = await readdir(issuesDir);
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to read issues directory at ${issuesDir}`,
      );
    }

    const summaries: IssueSummary[] = [];
    for (const filename of entries) {
      if (!filename.endsWith(".md")) {
        continue;
      }
      const issue = await this.readIssueFile(
        path.join(issuesDir, filename),
        filename,
      );
      summaries.push({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        triage: issue.triage,
        labels: issue.labels,
        updatedAt: issue.updatedAt,
        body: issue.body,
      });
    }

    summaries.sort(
      (a, b) => issueNumberFromId(b.id) - issueNumberFromId(a.id),
    );
    return summaries;
  }

  async get(id: string): Promise<Issue> {
    const filePath = this.issueFilePath(id);
    return this.readIssueFile(filePath, path.basename(filePath));
  }

  async create(input: CreateIssueInput): Promise<Issue> {
    const open = this.workspaceService.requireOpen();
    const issueNumber = open.meta.nextIssueNumber;
    const id = `${open.meta.issuePrefix}-${issueNumber}`;
    const now = new Date().toISOString();

    const issue: Issue = {
      id,
      title: input.title,
      status: input.status ?? "backlog",
      triage: input.triage ?? "needs-triage",
      labels: input.labels ?? [],
      createdAt: now,
      updatedAt: now,
      body: input.body ?? DEFAULT_ISSUE_BODY,
    };

    const filePath = this.issueFilePath(id);
    try {
      await writeFile(filePath, serializeIssue(issue), "utf8");
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to create issue file ${id}`,
      );
    }

    open.meta.nextIssueNumber = issueNumber + 1;
    await this.workspaceService.persistMeta();

    return issue;
  }

  async update(id: string, patch: UpdateIssuePatch): Promise<Issue> {
    const existing = await this.get(id);
    const updated: Issue = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const filePath = this.issueFilePath(id);
    try {
      await writeFile(filePath, serializeIssue(updated), "utf8");
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to update issue file ${id}`,
      );
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const filePath = this.issueFilePath(id);
    try {
      await unlink(filePath);
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOENT") {
        throw new ArgoError("ISSUE_NOT_FOUND", `Issue not found: ${id}`);
      }
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to delete issue file ${id}`,
      );
    }
  }

  private issueFilePath(id: string): string {
    const { rootPath } = this.workspaceService.requireOpen();
    return path.join(
      this.workspaceService.getIssuesDir(rootPath),
      `${id}.md`,
    );
  }

  private async readIssueFile(
    filePath: string,
    filename: string,
  ): Promise<Issue> {
    let content: string;
    try {
      content = await readFile(filePath, "utf8");
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOENT") {
        throw new ArgoError(
          "ISSUE_NOT_FOUND",
          `Issue not found: ${filename.replace(/\.md$/, "")}`,
        );
      }
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to read issue file ${filename}`,
      );
    }

    return parseIssueFile(content, filename);
  }
}
