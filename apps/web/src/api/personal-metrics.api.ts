import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  PersonalMetricsQuery,
  PersonalMetricsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const usePersonalMetrics = (
  args: PersonalMetricsQueryVariables,
  options?: Partial<UseQueryOptions<PersonalMetricsQuery>>,
) =>
  useQuery({
    queryKey: ["personal-metrics", args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PersonalMetrics($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              me {
                personalMetrics {
                  pullRequestSize {
                    current
                    previous
                    change
                  }
                  codeReviewAmount {
                    current
                    previous
                    change
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
