import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  PrFlowMetricsQuery,
  PrFlowMetricsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const usePrFlowMetricsQuery = (
  args: PrFlowMetricsQueryVariables,
  options?: Partial<UseQueryOptions<PrFlowMetricsQuery>>,
) =>
  useQuery({
    queryKey: [
      "pr-flow",
      args.workspaceId,
      args.input.dateRange.from,
      args.input.dateRange.to,
      args.input.period,
      args.input.teamIds,
      args.input.repositoryIds,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PrFlowMetrics(
            $workspaceId: SweetID!
            $input: PullRequestFlowInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                prFlow {
                  throughput(input: $input) {
                    columns
                    series {
                      name
                      data
                      color
                    }
                  }
                  cycleTimeBreakdown(input: $input) {
                    columns
                    cycleTime
                    timeToCode
                    timeToFirstReview
                    timeToApproval
                    timeToMerge
                  }
                  pullRequestSizeDistribution(input: $input) {
                    columns
                    series {
                      name
                      data
                      color
                    }
                    averageLinesChanged
                  }
                  sizeCycleTimeCorrelation(input: $input) {
                    series {
                      name
                      color
                      data {
                        x
                        y
                        title
                        url
                      }
                    }
                  }
                  teamOverview(input: $input) {
                    teamId
                    teamName
                    teamIcon
                    medianCycleTime
                    mergedCount
                    avgLinesChanged
                    pctBigPrs
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
