export function issueNumberFromId(id: string): number {
  const match = /-(\d+)$/.exec(id);
  if (!match) {
    return 0;
  }
  return Number.parseInt(match[1], 10);
}

export function sortIssuesDescending<T extends { id: string }>(issues: T[]): T[] {
  return [...issues].sort(
    (a, b) => issueNumberFromId(b.id) - issueNumberFromId(a.id),
  );
}
