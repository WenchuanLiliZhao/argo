import { useEffect, useMemo, useState } from "react";
import {
  collectLabels,
  filterIssues,
  hasActiveFilters,
  type IssueFilterState,
} from "../lib/filter-issues";
import type { IssueStatus, IssueSummary, TriageStatus } from "../types/issue";

const QUERY_DEBOUNCE_MS = 200;

type UseIssueFiltersResult = {
  query: string;
  setQuery: (query: string) => void;
  statuses: IssueStatus[];
  toggleStatus: (status: IssueStatus) => void;
  triages: TriageStatus[];
  toggleTriage: (triage: TriageStatus) => void;
  labels: string[];
  toggleLabel: (label: string) => void;
  availableLabels: string[];
  filteredIssues: IssueSummary[];
  filtersActive: boolean;
  clearFilters: () => void;
};

export function useIssueFilters(issues: IssueSummary[]): UseIssueFiltersResult {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statuses, setStatuses] = useState<IssueStatus[]>([]);
  const [triages, setTriages] = useState<TriageStatus[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, QUERY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const filterState: IssueFilterState = useMemo(
    () => ({
      query: debouncedQuery,
      statuses,
      triages,
      labels,
    }),
    [debouncedQuery, labels, statuses, triages],
  );

  const filteredIssues = useMemo(
    () => filterIssues(issues, filterState),
    [filterState, issues],
  );

  const availableLabels = useMemo(() => collectLabels(issues), [issues]);

  const toggleStatus = (status: IssueStatus) => {
    setStatuses((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  const toggleTriage = (triage: TriageStatus) => {
    setTriages((current) =>
      current.includes(triage)
        ? current.filter((value) => value !== triage)
        : [...current, triage],
    );
  };

  const toggleLabel = (label: string) => {
    setLabels((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : [...current, label],
    );
  };

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setStatuses([]);
    setTriages([]);
    setLabels([]);
  };

  return {
    query,
    setQuery,
    statuses,
    toggleStatus,
    triages,
    toggleTriage,
    labels,
    toggleLabel,
    availableLabels,
    filteredIssues,
    filtersActive: hasActiveFilters(filterState),
    clearFilters,
  };
}
