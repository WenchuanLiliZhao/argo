import type { TriageStatus } from "../types/issue";

export const TRIAGE_STATUS_OPTIONS: Array<{
  value: TriageStatus;
  label: string;
}> = [
  { value: "needs-triage", label: "Needs triage" },
  { value: "needs-info", label: "Needs info" },
  { value: "ready-for-agent", label: "Ready for agent" },
  { value: "ready-for-human", label: "Ready for human" },
  { value: "wontfix", label: "Won't fix" },
];

export function triageStatusLabel(triage: TriageStatus): string {
  return (
    TRIAGE_STATUS_OPTIONS.find((option) => option.value === triage)?.label ??
    triage
  );
}
