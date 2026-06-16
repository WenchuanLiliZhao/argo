export type IssueViewMode = "list" | "board";

type ViewModeToggleProps = {
  mode: IssueViewMode;
  onChange: (mode: IssueViewMode) => void;
};

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="view-mode-toggle" role="tablist" aria-label="Issue view">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "list"}
        className={mode === "list" ? "view-mode-active" : undefined}
        onClick={() => onChange("list")}
      >
        List
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "board"}
        className={mode === "board" ? "view-mode-active" : undefined}
        onClick={() => onChange("board")}
      >
        Board
      </button>
    </div>
  );
}
