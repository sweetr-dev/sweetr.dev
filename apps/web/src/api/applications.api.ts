import { graphql } from "@sweetr/graphql-types/frontend";
import {
  ApplicationOptionsQuery,
  ApplicationOptionsQueryVariables,
  ApplicationQuery,
  ApplicationQueryVariables,
  ApplicationsQuery,
  ApplicationsQueryVariables,
  ArchiveApplicationMutation,
  MutationArchiveApplicationArgs,
  MutationUnarchiveApplicationArgs,
  MutationUpsertApplicationArgs,
  UnarchiveApplicationMutation,
  UpsertApplicationMutation,
} from "@sweetr/graphql-types/frontend/graphql";
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
import { Optional } from "utility-types";
import { graphQLClient } from "./clients/graphql-client";
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
                  targetBranch
                }
                archivedAt
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
                team {
                  id
                  name
                  icon
                }
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
    queryKey: ["applications", args.workspaceId, ...Object.values(args.input)],
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
                repository {
                  id
                  fullName
                }
                lastProductionDeployment {
                  id
                  version
                  deployedAt
                }
                archivedAt
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

export const useArchiveApplication = (
  options?: UseMutationOptions<
    ArchiveApplicationMutation,
    unknown,
    MutationArchiveApplicationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ArchiveApplication($input: ArchiveApplicationInput!) {
            archiveApplication(input: $input) {
              id
              name
              description
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    ...options,
  });

export const useUnarchiveApplication = (
  options?: UseMutationOptions<
    UnarchiveApplicationMutation,
    unknown,
    MutationUnarchiveApplicationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UnarchiveApplication($input: UnarchiveApplicationInput!) {
            unarchiveApplication(input: $input) {
              id
              name
              description
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    ...options,
  });
