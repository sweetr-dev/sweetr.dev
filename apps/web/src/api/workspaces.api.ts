import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  UserWorkspacesQuery,
  UserWorkspacesQueryVariables,
  QueryWorkspaceByInstallationIdArgs,
  WorkspaceByInstallationIdQuery,
  WorkspaceSyncProgressQuery,
  WorkspaceSyncProgressQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

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
