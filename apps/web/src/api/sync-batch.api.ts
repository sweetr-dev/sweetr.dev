import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  MutationScheduleSyncBatchArgs,
  ScheduleSyncBatchMutation,
  WorkspaceLastSyncBatchQuery,
  WorkspaceLastSyncBatchQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useWorkspaceLastSyncBatchQuery = (
  args: WorkspaceLastSyncBatchQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceLastSyncBatchQuery>>,
) =>
  useQuery({
    queryKey: ["workspace", args.workspaceId, "sync-progress"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceLastSyncBatch($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              lastSyncBatch {
                scheduledAt
                finishedAt
                sinceDaysAgo
                progress
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useScheduleSyncBatchMutation = (
  options?: UseMutationOptions<
    ScheduleSyncBatchMutation,
    unknown,
    MutationScheduleSyncBatchArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ScheduleSyncBatch($input: ScheduleSyncBatchInput!) {
            scheduleSyncBatch(input: $input) {
              scheduledAt
              finishedAt
              sinceDaysAgo
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
