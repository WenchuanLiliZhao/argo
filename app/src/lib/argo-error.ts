export function formatArgoError(err: unknown): string {
  if (err instanceof Error) {
    const code =
      typeof err.code === "string" ? ` [${err.code}]` : "";
    return `${err.message}${code}`;
  }
  return String(err);
}
