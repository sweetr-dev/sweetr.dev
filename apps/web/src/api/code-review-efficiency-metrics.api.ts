import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  CodeReviewEfficiencyMetricsQuery,
  CodeReviewEfficiencyMetricsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useCodeReviewEfficiencyMetricsQuery = (
  args: CodeReviewEfficiencyMetricsQueryVariables,
  options?: Partial<UseQueryOptions<CodeReviewEfficiencyMetricsQuery>>,
) =>
  useQuery({
    queryKey: [
      "code-review-efficiency-metrics",
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
          query CodeReviewEfficiencyMetrics(
            $workspaceId: SweetID!
            $input: CodeReviewEfficiencyInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              metrics {
                codeReviewEfficiency {
                  reviewTurnaroundTime(input: $input) {
                    columns
                    data
                  }
                  timeToApproval(input: $input) {
                    columns
                    data
                  }
                  kpi(input: $input) {
                    timeToFirstReview {
                      currentAmount
                      previousAmount
                      change
                      previousPeriod {
                        from
                        to
                      }
                    }
                    timeToApproval {
                      currentAmount
                      previousAmount
                      change
                      previousPeriod {
                        from
                        to
                      }
                    }
                    avgCommentsPerPr {
                      currentAmount
                      previousAmount
                      change
                      previousPeriod {
                        from
                        to
                      }
                    }
                    prsWithoutApproval {
                      currentAmount
                      previousAmount
                      change
                      previousPeriod {
                        from
                        to
                      }
                    }
                  }
                  sizeCommentCorrelation(input: $input) {
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
                      isFromTeam
                    }
                    totalReviews
                  }
                  teamOverview(input: $input) {
                    teamId
                    teamName
                    teamIcon
                    avgTimeToFirstReview
                    avgTimeToApproval
                    prsWithoutApproval
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
