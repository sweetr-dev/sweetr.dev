import {
  DefaultError,
  InfiniteData,
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
  ApplicationOptionsQuery,
  ApplicationOptionsQueryVariables,
  ApplicationQuery,
  ApplicationQueryVariables,
  ApplicationsQuery,
  ApplicationsQueryVariables,
  MutationUpsertApplicationArgs,
  UpsertApplicationMutation,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";
import { queryClient } from "./clients/query-client";

export const useApplicationQuery = (
  args: ApplicationQueryVariables,
  options?: Partial<UseQueryOptions<ApplicationQuery>>,
) =>
  useQuery({
    queryKey: ["application", args.workspaceId, args.applicationId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Application($workspaceId: SweetID!, $applicationId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              application(applicationId: $applicationId) {
                id
                name
                description
                team {
                  id
                  name
                  icon
                }
                repository {
                  id
                  name
                }
                deploymentSettings {
                  trigger
                  subdirectory
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useApplicationOptionsQuery = (
  args: ApplicationOptionsQueryVariables,
  options?: Partial<UseQueryOptions<ApplicationOptionsQuery>>,
) =>
  useQuery({
    queryKey: ["applications", args.workspaceId, args.input.query],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query ApplicationOptions(
            $workspaceId: SweetID!
            $input: ApplicationsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              applications(input: $input) {
                id
                name
                description
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useApplicationsInfiniteQuery = (
  args: ApplicationsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      ApplicationsQuery,
      DefaultError,
      InfiniteData<ApplicationsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["applications", args.workspaceId, args.input.teamIds],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Applications(
            $workspaceId: SweetID!
            $input: ApplicationsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              applications(input: $input) {
                id
                name
                description
                team {
                  id
                  name
                  icon
                  startColor
                  endColor
                }
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });

export const useUpsertApplicationMutation = (
  options?: UseMutationOptions<
    UpsertApplicationMutation,
    unknown,
    MutationUpsertApplicationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpsertApplication($input: UpsertApplicationInput!) {
            upsertApplication(input: $input) {
              id
              name
              description
              team {
                id
                name
              }
            }
          }
        `),
        args,
      ),
    onSettled: (_, __, args) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.resetQueries({
        queryKey: [
          "application",
          args.input.workspaceId,
          args.input.applicationId,
        ],
      });
    },
    ...options,
  });
