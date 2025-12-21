import {
  DoraMetricsQuery,
  DoraMetricsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
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
                  }
                  leadTime(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                  }
                  changeFailureRate(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
                  }
                  meanTimeToRecover(input: $input) {
                    currentAmount
                    previousAmount
                    change
                    columns
                    data
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
