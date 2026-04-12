import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  CodeReviewDistributionWorkspaceQuery,
  CodeReviewDistributionWorkspaceQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useCodeReviewDistributionWorkspaceQuery = (
  args: CodeReviewDistributionWorkspaceQueryVariables,
  options?: Partial<UseQueryOptions<CodeReviewDistributionWorkspaceQuery>>,
) =>
  useQuery({
    queryKey: [
      "code-review-distribution-workspace",
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
          query CodeReviewDistributionWorkspace(
            $workspaceId: SweetID!
            $input: PullRequestFlowInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                prFlow {
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
          }
        `),
        args,
      ),
    ...options,
  });
