import {
  DefaultError,
  InfiniteData,
  Optional,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  EnvironmentOptionsQuery,
  EnvironmentOptionsQueryVariables,
  EnvironmentsQuery,
  EnvironmentsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

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
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
