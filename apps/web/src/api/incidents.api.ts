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
import { Optional } from "utility-types";
import {
  ArchiveIncidentMutation,
  IncidentQuery,
  IncidentQueryVariables,
  IncidentsQuery,
  IncidentsQueryVariables,
  MutationArchiveIncidentArgs,
  MutationUnarchiveIncidentArgs,
  MutationUpsertIncidentArgs,
  UnarchiveIncidentMutation,
  UpsertIncidentMutation,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useIncidentsInfiniteQuery = (
  args: IncidentsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      IncidentsQuery,
      DefaultError,
      InfiniteData<IncidentsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: [
      "incidents",
      args.workspaceId,
      args.input.cursor,
      ...Object.values(args.input),
    ],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Incidents(
            $workspaceId: SweetID!
            $input: IncidentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              incidents(input: $input) {
                id
                team {
                  id
                  name
                  icon
                }
                leader {
                  id
                  name
                  avatar
                }
                detectedAt
                resolvedAt
                postmortemUrl
                archivedAt
                causeDeployment {
                  id
                  version
                  application {
                    id
                    name
                  }
                }
                fixDeployment {
                  id
                  version
                  application {
                    id
                    name
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

export const useIncidentQuery = (
  args: IncidentQueryVariables,
  options?: Partial<UseQueryOptions<IncidentQuery>>,
) =>
  useQuery({
    queryKey: ["incident", args.workspaceId, args.incidentId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Incident($workspaceId: SweetID!, $incidentId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              incident(incidentId: $incidentId) {
                id
                team {
                  id
                  name
                  icon
                }
                leader {
                  id
                  name
                  avatar
                }
                detectedAt
                resolvedAt
                postmortemUrl
                archivedAt
                causeDeployment {
                  id
                  version
                  application {
                    id
                    name
                  }
                }
                fixDeployment {
                  id
                  version
                  application {
                    id
                    name
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

export const useUpsertIncidentMutation = (
  options?: UseMutationOptions<
    UpsertIncidentMutation,
    unknown,
    MutationUpsertIncidentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpsertIncident($input: UpsertIncidentInput!) {
            upsertIncident(input: $input) {
              id
            }
          }
        `),
        args,
      ),
    onSettled: (_, __, args) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.resetQueries({
        queryKey: ["incident", args.input.workspaceId, args.input.incidentId],
      });
    },
    ...options,
  });

export const useArchiveIncident = (
  options?: UseMutationOptions<
    ArchiveIncidentMutation,
    unknown,
    MutationArchiveIncidentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ArchiveIncident($input: ArchiveIncidentInput!) {
            archiveIncident(input: $input) {
              id
              detectedAt
              resolvedAt
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
    ...options,
  });

export const useUnarchiveIncident = (
  options?: UseMutationOptions<
    UnarchiveIncidentMutation,
    unknown,
    MutationUnarchiveIncidentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UnarchiveIncident($input: UnarchiveIncidentInput!) {
            unarchiveIncident(input: $input) {
              id
              detectedAt
              resolvedAt
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
    ...options,
  });
