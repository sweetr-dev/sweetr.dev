import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  PullRequestsQueryVariables,
  PullRequestsQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const usePullRequestsInfiniteQuery = (
  args: PullRequestsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      PullRequestsQuery,
      DefaultError,
      InfiniteData<PullRequestsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["team", args.workspaceId, "pull-requests", args.input],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PullRequests(
            $workspaceId: SweetID!
            $input: PullRequestsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              pullRequests(input: $input) {
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
                  timeToMerge
                  timeToFirstApproval
                  firstReviewAt
                  firstApprovalAt
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
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
