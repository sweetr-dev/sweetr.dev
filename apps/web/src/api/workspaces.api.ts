import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  UserWorkspacesQuery,
  UserWorkspacesQueryVariables,
  QueryWorkspaceByInstallationIdArgs,
  WorkspaceByInstallationIdQuery,
  WorkspaceSyncProgressQuery,
  WorkspaceSyncProgressQueryVariables,
  MutationUpdateWorkspaceSettingsArgs,
  UpdateWorkspaceSettingsMutation,
  WorkspaceSettingsQuery,
  WorkspaceSettingsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const userWorkspacesQuery = (
  args: UserWorkspacesQueryVariables,
  options?: UseQueryOptions<UserWorkspacesQuery>,
) => ({
  queryKey: ["user-workspaces"],
  queryFn: () =>
    graphQLClient.request(
      graphql(/* GraphQL */ `
        query UserWorkspaces {
          userWorkspaces {
            id
            name
            avatar
            handle
            gitUninstallUrl
            me {
              id
              handle
              name
              avatar
              email
            }
            billing {
              trial {
                endAt
              }
              subscription {
                isActive
              }
            }
            isActiveCustomer
          }
        }
      `),
      args,
    ),
  ...options,
});

export const useUserWorkspacesQuery = (
  args: UserWorkspacesQueryVariables,
  options?: UseQueryOptions<UserWorkspacesQuery>,
) => useQuery(userWorkspacesQuery(args, options));

export const useWorkspaceByInstallationIdQuery = (
  args: QueryWorkspaceByInstallationIdArgs,
  options?: Partial<UseQueryOptions<WorkspaceByInstallationIdQuery>>,
) =>
  useQuery({
    queryKey: ["workspaceByInstallationId", args.gitInstallationId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceByInstallationId($gitInstallationId: String!) {
            workspaceByInstallationId(gitInstallationId: $gitInstallationId) {
              id
              name
              avatar
              handle
              gitUninstallUrl
              isActiveCustomer
              repositories {
                id
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useWorkspaceSyncProgressQuery = (
  args: WorkspaceSyncProgressQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceSyncProgressQuery>>,
) =>
  useQuery({
    queryKey: ["workspace", args.workspaceId, "sync-progress"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceSyncProgress($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              initialSyncProgress
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useWorkspaceSettingsQuery = (
  args: WorkspaceSettingsQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceSettingsQuery>>,
) =>
  useQuery({
    queryKey: ["workspace", args.workspaceId, "settings"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceSettings($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              id
              settings {
                pullRequest {
                  size {
                    tiny
                    small
                    medium
                    large
                    ignorePatterns
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

export const useUpdateWorkspaceSettingsMutation = (
  options?: UseMutationOptions<
    UpdateWorkspaceSettingsMutation,
    unknown,
    MutationUpdateWorkspaceSettingsArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpdateWorkspaceSettings(
            $input: UpdateWorkspaceSettingsInput!
          ) {
            updateWorkspaceSettings(input: $input) {
              id
              settings {
                pullRequest {
                  size {
                    tiny
                    small
                    medium
                    large
                  }
                }
              }
            }
          }
        `),
        args,
      ),
    onSettled: (_, __, args) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", args.input.workspaceId, "settings"],
      });
    },
    ...options,
  });
