import { graphql } from "@sweetr/graphql-types/frontend";
import {
  DoraMetricsQuery,
  DoraMetricsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { graphQLClient } from "./clients/graphql-client";

export const useDoraMetricsQuery = (
  args: DoraMetricsQueryVariables,
  options?: Partial<UseQueryOptions<DoraMetricsQuery>>,
) =>
  useQuery({
    queryKey: ["metrics", "dora", ...Object.values(args.input)],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query DoraMetrics(
            $workspaceId: SweetID!
            $input: WorkspaceMetricInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                dora {
                  deploymentFrequency(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                    avg
                    currentPeriod {
                      from
                      to
                    }
                    previousPeriod {
                      from
                      to
                    }
                  }
                  leadTime(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                    currentPeriod {
                      from
                      to
                    }
                    previousPeriod {
                      from
                      to
                    }
                    breakdown {
                      codingTime {
                        currentAmount
                        previousAmount
                        change
                      }
                      timeToFirstReview {
                        currentAmount
                        previousAmount
                        change
                      }
                      timeToApprove {
                        currentAmount
                        previousAmount
                        change
                      }
                      timeToMerge {
                        currentAmount
                        previousAmount
                        change
                      }
                      timeToDeploy {
                        currentAmount
                        previousAmount
                        change
                      }
                    }
                  }
                  changeFailureRate(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                    currentPeriod {
                      from
                      to
                    }
                    previousPeriod {
                      from
                      to
                    }
                  }
                  meanTimeToRecover(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                    currentPeriod {
                      from
                      to
                    }
                    previousPeriod {
                      from
                      to
                    }
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
