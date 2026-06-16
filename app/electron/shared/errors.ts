export type ArgoErrorCode =
  | "WORKSPACE_NOT_FOUND"
  | "WORKSPACE_INVALID"
  | "ISSUE_NOT_FOUND"
  | "IO_ERROR"
  | "NO_WORKSPACE_OPEN";

export class ArgoError extends Error {
  readonly code: ArgoErrorCode;

  constructor(
    code: ArgoErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "ArgoError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function rethrowAsArgoError(
  err: unknown,
  code: ArgoErrorCode,
  message: string,
): never {
  if (err instanceof ArgoError) {
    throw err;
  }
  throw new ArgoError(code, message, { cause: err });
}
