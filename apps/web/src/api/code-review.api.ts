import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  PersonCodeReviewsQueryVariables,
  PersonCodeReviewsQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const useCodeReviewsInfiniteQuery = (
  args: PersonCodeReviewsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      PersonCodeReviewsQuery,
      DefaultError,
      InfiniteData<PersonCodeReviewsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["person", args.workspaceId, args.handle, "code-reviews"],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PersonCodeReviews(
            $workspaceId: SweetID!
            $handle: String!
            $input: CodeReviewsInput
          ) {
            workspace(workspaceId: $workspaceId) {
              person(handle: $handle) {
                codeReviews(input: $input) {
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
                    tracking {
                      size
                      changedFilesCount
                      linesAddedCount
                      linesDeletedCount
                      firstReviewAt
                      timeToFirstReview
                    }
                    author {
                      id
                      name
                      handle
                      avatar
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
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
