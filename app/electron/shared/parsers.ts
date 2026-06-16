import type { IssueFrontmatter, IssueStatus, TriageStatus, WorkspaceMeta } from "./types.js";

const ISSUE_STATUSES: readonly IssueStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "done",
];

const TRIAGE_STATUSES: readonly TriageStatus[] = [
  "needs-triage",
  "needs-info",
  "ready-for-agent",
  "ready-for-human",
  "wontfix",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === "string" &&
    ISSUE_STATUSES.includes(value as IssueStatus)
  );
}

function isTriageStatus(value: unknown): value is TriageStatus {
  return (
    typeof value === "string" &&
    TRIAGE_STATUSES.includes(value as TriageStatus)
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export function parseWorkspaceMeta(data: unknown): WorkspaceMeta {
  if (!isRecord(data)) {
    throw new Error("workspace.json must be an object");
  }

  if (data.version !== 1) {
    throw new Error("workspace.json version must be 1");
  }

  if (!isNonEmptyString(data.name)) {
    throw new Error("workspace.json name must be a non-empty string");
  }

  if (!isNonEmptyString(data.issuePrefix)) {
    throw new Error("workspace.json issuePrefix must be a non-empty string");
  }

  if (
    typeof data.nextIssueNumber !== "number" ||
    !Number.isInteger(data.nextIssueNumber) ||
    data.nextIssueNumber < 1
  ) {
    throw new Error("workspace.json nextIssueNumber must be a positive integer");
  }

  if (!Array.isArray(data.columns) || data.columns.length !== 4) {
    throw new Error("workspace.json columns must contain exactly 4 statuses");
  }

  if (!data.columns.every(isIssueStatus)) {
    throw new Error("workspace.json columns contain invalid status values");
  }

  if (!isNonEmptyString(data.createdAt) || !isNonEmptyString(data.openedAt)) {
    throw new Error("workspace.json createdAt and openedAt must be strings");
  }

  return {
    version: 1,
    name: data.name,
    issuePrefix: data.issuePrefix,
    nextIssueNumber: data.nextIssueNumber,
    columns: data.columns,
    createdAt: data.createdAt,
    openedAt: data.openedAt,
  };
}

export function parseIssueFrontmatter(data: unknown): IssueFrontmatter {
  if (!isRecord(data)) {
    throw new Error("issue frontmatter must be an object");
  }

  if (!isNonEmptyString(data.id)) {
    throw new Error("issue id must be a non-empty string");
  }

  if (!isNonEmptyString(data.title)) {
    throw new Error("issue title must be a non-empty string");
  }

  if (!isIssueStatus(data.status)) {
    throw new Error("issue status is invalid");
  }

  if (!isTriageStatus(data.triage)) {
    throw new Error("issue triage is invalid");
  }

  if (!isStringArray(data.labels)) {
    throw new Error("issue labels must be a string array");
  }

  if (!isNonEmptyString(data.createdAt) || !isNonEmptyString(data.updatedAt)) {
    throw new Error("issue createdAt and updatedAt must be strings");
  }

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    triage: data.triage,
    labels: data.labels,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
