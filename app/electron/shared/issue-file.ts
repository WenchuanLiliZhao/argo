import matter from "gray-matter";
import { ArgoError } from "./errors.js";
import { parseIssueFrontmatter } from "./parsers.js";
import type { Issue, IssueFrontmatter } from "./types.js";

export function parseIssueFile(content: string, filename: string): Issue {
  const parsed = matter(content);

  try {
    const frontmatter = parseIssueFrontmatter(parsed.data);
    return {
      ...frontmatter,
      body: parsed.content.replace(/^\n/, ""),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ArgoError(
      "WORKSPACE_INVALID",
      `Invalid issue frontmatter in ${filename}: ${message}`,
    );
  }
}

export function serializeIssue(issue: Issue): string {
  const { body, ...frontmatter } = issue;
  return matter.stringify(body, frontmatter as IssueFrontmatter);
}

export function issueNumberFromId(id: string): number {
  const match = /-(\d+)$/.exec(id);
  if (!match) {
    throw new ArgoError("WORKSPACE_INVALID", `Invalid issue id format: ${id}`);
  }
  return Number.parseInt(match[1], 10);
}
