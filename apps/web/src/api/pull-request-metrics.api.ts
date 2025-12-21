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
      "metrics",
      "time-to-merge",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToMerge(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                timeToMerge(input: $input) {
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
      "metrics",
      "time-to-first-review",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToFirstReview(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                timeForFirstReview(input: $input) {
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
      "metrics",
      "time-to-approval",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartTimeToApproval(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                timeForApproval(input: $input) {
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
      "metrics",
      "cycle-time",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartCycleTime(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                cycleTime(input: $input) {
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
      "metrics",
      "pull-request-size-distribution",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PullRequestSizeDistribution(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                pullRequestSizeDistribution(input: $input) {
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
      "metrics",
      "code-review-distribution",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ChartCodeReviewDistribution(
            $workspaceId: SweetID!
            $input: TeamMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                codeReviewDistribution(input: $input) {
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
