import {
  DefaultError,
  InfiniteData,
  Optional,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  ArchiveEnvironmentMutation,
  EnvironmentOptionsQuery,
  EnvironmentOptionsQueryVariables,
  EnvironmentsQuery,
  EnvironmentsQueryVariables,
  MutationArchiveEnvironmentArgs,
  MutationUnarchiveEnvironmentArgs,
  UnarchiveEnvironmentMutation,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useEnvironmentOptionsQuery = (
  args: EnvironmentOptionsQueryVariables,
  options?: Partial<UseQueryOptions<EnvironmentOptionsQuery>>,
) =>
  useQuery({
    queryKey: ["environments", args.workspaceId, ...Object.values(args.input)],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query EnvironmentOptions(
            $workspaceId: SweetID!
            $input: EnvironmentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              environments(input: $input) {
                id
                name
                isProduction
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useEnvironmentsInfiniteQuery = (
  args: EnvironmentsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      EnvironmentsQuery,
      DefaultError,
      InfiniteData<EnvironmentsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["environments", args.workspaceId, ...Object.values(args.input)],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Environments(
            $workspaceId: SweetID!
            $input: EnvironmentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              environments(input: $input) {
                id
                name
                isProduction
                archivedAt
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });

export const useArchiveEnvironment = (
  options?: UseMutationOptions<
    ArchiveEnvironmentMutation,
    unknown,
    MutationArchiveEnvironmentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ArchiveEnvironment($input: ArchiveEnvironmentInput!) {
            archiveEnvironment(input: $input) {
              id
              name
              isProduction
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
    ...options,
  });

export const useUnarchiveEnvironment = (
  options?: UseMutationOptions<
    UnarchiveEnvironmentMutation,
    unknown,
    MutationUnarchiveEnvironmentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UnarchiveEnvironment($input: UnarchiveEnvironmentInput!) {
            unarchiveEnvironment(input: $input) {
              id
              name
              isProduction
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
    ...options,
  });
