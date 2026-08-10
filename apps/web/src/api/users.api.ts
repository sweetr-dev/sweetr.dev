import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  WorkspaceUsersQuery,
  WorkspaceUsersQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const useWorkspaceUsersInfiniteQuery = (
  args: WorkspaceUsersQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      WorkspaceUsersQuery,
      DefaultError,
      InfiniteData<WorkspaceUsersQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["workspace-users", args.workspaceId, args.input],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceUsers(
            $workspaceId: SweetID!
            $input: WorkspaceUsersQueryInput
          ) {
            workspace(workspaceId: $workspaceId) {
              users(input: $input) {
                id
                name
                handle
                avatar
                role
                lastLoginAt
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
