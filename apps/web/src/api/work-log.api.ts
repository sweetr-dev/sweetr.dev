import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  TeamWorkLogQuery,
  TeamWorkLogQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useTeamWorkLogQuery = (
  args: TeamWorkLogQueryVariables,
  options?: Partial<UseQueryOptions<TeamWorkLogQuery>>,
) =>
  useQuery({
    queryKey: [
      "team",
      "work-log",
      args.workspaceId,
      args.teamId,
      args.input.dateRange.from,
      args.input.dateRange.to,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamWorkLog(
            $workspaceId: SweetID!
            $teamId: SweetID!
            $input: TeamWorkLogInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                members {
                  id
                  role
                  person {
                    id
                    name
                    handle
                    avatar
                  }
                }
                workLog(input: $input) {
                  columns
                  data {
                    __typename
                    ... on CodeReviewSubmittedEvent {
                      eventAt
                      codeReview {
                        id
                        state
                        commentCount
                        createdAt
                        author {
                          id
                          name
                          handle
                          avatar
                        }
                        pullRequest {
                          id
                          title
                          gitUrl
                          commentCount
                          changedFilesCount
                          linesAddedCount
                          linesDeletedCount
                          state
                          createdAt
                          mergedAt
                          closedAt
                          tracking {
                            size
                            changedFilesCount
                            linesAddedCount
                            linesDeletedCount
                            timeToCode
                            timeToFirstReview
                            timeToFirstApproval
                            timeToMerge
                            timeToDeploy
                            firstReviewAt
                            firstApprovalAt
                            firstDeployedAt
                            cycleTime
                          }
                          author {
                            id
                            avatar
                            handle
                            name
                          }
                          repository {
                            id
                            name
                            fullName
                          }
                        }
                      }
                    }
                    ... on PullRequestCreatedEvent {
                      eventAt
                      pullRequest {
                        id
                        title
                        gitUrl
                        commentCount
                        changedFilesCount
                        linesAddedCount
                        linesDeletedCount
                        state
                        createdAt
                        mergedAt
                        closedAt
                        tracking {
                          size
                          changedFilesCount
                          linesAddedCount
                          linesDeletedCount
                          timeToCode
                          timeToFirstReview
                          timeToFirstApproval
                          timeToMerge
                          timeToDeploy
                          firstReviewAt
                          firstApprovalAt
                          firstDeployedAt
                          cycleTime
                        }
                        author {
                          id
                          avatar
                          handle
                          name
                        }
                        repository {
                          id
                          name
                          fullName
                        }
                      }
                    }
                    ... on PullRequestMergedEvent {
                      eventAt
                      pullRequest {
                        id
                        title
                        gitUrl
                        commentCount
                        changedFilesCount
                        linesAddedCount
                        linesDeletedCount
                        state
                        createdAt
                        mergedAt
                        closedAt
                        tracking {
                          size
                          changedFilesCount
                          linesAddedCount
                          linesDeletedCount
                          timeToCode
                          timeToFirstReview
                          timeToFirstApproval
                          timeToMerge
                          timeToDeploy
                          firstReviewAt
                          firstApprovalAt
                          firstDeployedAt
                          cycleTime
                        }
                        author {
                          id
                          avatar
                          handle
                          name
                        }
                        repository {
                          id
                          name
                          fullName
                        }
                      }
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
