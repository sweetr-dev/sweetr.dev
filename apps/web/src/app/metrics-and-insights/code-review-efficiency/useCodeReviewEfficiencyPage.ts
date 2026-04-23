import { useForm } from "@mantine/form";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  endOfToday,
} from "date-fns";
import { useCallback } from "react";
import { useCodeReviewEfficiencyMetricsQuery } from "../../../api/code-review-efficiency-metrics.api";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { thirtyDaysAgo } from "../../../providers/date.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { CodeReviewEfficiencyFilters } from "./types";

export const useCodeReviewEfficiencyPage = () => {
  const searchParams = useFilterSearchParameters();
  const { workspace } = useWorkspace();

  const filters = useForm<CodeReviewEfficiencyFilters>({
    initialValues: {
      from: searchParams.get("from") || thirtyDaysAgo().toISOString(),
      to: searchParams.get("to") || endOfToday().toISOString(),
      teamIds: searchParams.getAll<string[]>("team") || [],
      repositoryIds: searchParams.getAll<string[]>("repository") || [],
      period: (searchParams.get("period") as Period) || Period.WEEKLY,
    },
  });

  const queryInput = {
    dateRange: {
      from: filters.values.from,
      to: filters.values.to,
    },
    period: filters.values.period,
    teamIds: filters.values.teamIds.length ? filters.values.teamIds : undefined,
    repositoryIds: filters.values.repositoryIds.length
      ? filters.values.repositoryIds
      : undefined,
  };

  const queryArgs = { workspaceId: workspace.id, input: queryInput };

  const { data, isLoading } = useCodeReviewEfficiencyMetricsQuery(queryArgs);
  const metrics = data?.workspace.metrics?.codeReviewEfficiency;
  const kpi = metrics?.kpi;

  const codeReviewDistribution = metrics?.codeReviewDistribution;
  const isDistributionEmpty =
    !codeReviewDistribution?.entities.length && !isLoading;

  const reviewers = codeReviewDistribution?.entities.filter(
    (entity) => entity.reviewCount !== null,
  );

  const buildPullRequestsUrl = useCallback(
    (overrides?: {
      from?: string;
      to?: string;
      dateType?: "created" | "completed";
    }) => {
      const params = new URLSearchParams();
      const from = overrides?.from ?? filters.values.from;
      const to = overrides?.to ?? filters.values.to;
      const dateType = overrides?.dateType ?? "completed";

      const fromKey =
        dateType === "created" ? "createdAtFrom" : "completedAtFrom";
      const toKey = dateType === "created" ? "createdAtTo" : "completedAtTo";

      if (from) params.set(fromKey, from);
      if (to) params.set(toKey, to);

      for (const id of filters.values.teamIds) {
        params.append("team", id);
      }
      for (const id of filters.values.repositoryIds) {
        params.append("repository", id);
      }

      const qs = params.toString();
      return `/systems/pull-requests${qs ? `?${qs}` : ""}`;
    },
    [filters.values],
  );

  const getPeriodEnd = useCallback(
    (start: Date) => {
      const periodEndFn: Record<Period, (d: Date) => Date> = {
        [Period.DAILY]: (d) => addDays(d, 1),
        [Period.WEEKLY]: (d) => addWeeks(d, 1),
        [Period.MONTHLY]: (d) => addMonths(d, 1),
        [Period.QUARTERLY]: (d) => addQuarters(d, 1),
        [Period.YEARLY]: (d) => addYears(d, 1),
      };
      return periodEndFn[filters.values.period](start);
    },
    [filters.values.period],
  );

  const handleColumnClick = useCallback(
    (columnDate: string) => {
      const start = new Date(columnDate);
      const end = getPeriodEnd(start);
      const url = buildPullRequestsUrl({
        from: start.toISOString(),
        to: end.toISOString(),
      });
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [getPeriodEnd, buildPullRequestsUrl],
  );

  return {
    searchParams,
    filters,
    isLoading,
    metrics,
    kpi,
    codeReviewDistribution,
    isDistributionEmpty,
    reviewers,
    handleColumnClick,
  };
};
