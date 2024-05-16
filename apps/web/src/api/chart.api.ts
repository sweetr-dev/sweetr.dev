import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  ChartCodeReviewDistributionQuery,
  ChartCodeReviewDistributionQueryVariables,
  ChartCycleTimeQuery,
  ChartCycleTimeQueryVariables,
  ChartTimeToApprovalQuery,
  ChartTimeToApprovalQueryVariables,
  ChartTimeToFirstReviewQuery,
  ChartTimeToFirstReviewQueryVariables,
  ChartTimeToMergeQuery,
  ChartTimeToMergeQueryVariables,
  PullRequestSizeDistributionQuery,
  PullRequestSizeDistributionQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useChartTimeToMergeQuery = (
  args: ChartTimeToMergeQueryVariables,
  options?: Partial<UseQueryOptions<ChartTimeToMergeQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "time-to-merge",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToMerge(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                timeToMerge {
                  columns
                  data
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useChartTimeToFirstReviewQuery = (
  args: ChartTimeToFirstReviewQueryVariables,
  options?: Partial<UseQueryOptions<ChartTimeToFirstReviewQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "time-to-first-review",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToFirstReview(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                timeForFirstReview {
                  columns
                  data
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useChartTimeToApprovalQuery = (
  args: ChartTimeToApprovalQueryVariables,
  options?: Partial<UseQueryOptions<ChartTimeToApprovalQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "time-to-approval",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToApproval(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                timeForApproval {
                  columns
                  data
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useChartCycleTimeQuery = (
  args: ChartCycleTimeQueryVariables,
  options?: Partial<UseQueryOptions<ChartCycleTimeQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "cycle-time",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartCycleTime(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                cycleTime {
                  columns
                  data
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const usePullRequestSizeDistributionQuery = (
  args: PullRequestSizeDistributionQueryVariables,
  options?: Partial<UseQueryOptions<PullRequestSizeDistributionQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "pull-request-size-distribution",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PullRequestSizeDistribution(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                pullRequestSizeDistribution {
                  columns
                  series {
                    name
                    data
                    color
                  }
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useCodeReviewDistributionQuery = (
  args: ChartCodeReviewDistributionQueryVariables,
  options?: Partial<UseQueryOptions<ChartCodeReviewDistributionQuery>>,
) =>
  useQuery({
    queryKey: [
      "charts",
      "code-review-distribution",
      args.workspaceId,
      args.chartInput.dateRange.from,
      args.chartInput.dateRange.to,
      args.chartInput.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartCodeReviewDistribution(
            $workspaceId: SweetID!
            $chartInput: ChartInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              charts(input: $chartInput) {
                codeReviewDistribution {
                  entities {
                    id
                    name
                    image
                    reviewCount
                    reviewSharePercentage
                  }
                  links {
                    source
                    target
                    value
                  }
                  totalReviews
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });
