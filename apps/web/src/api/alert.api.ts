import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  UpdateAlertMutation,
  MutationUpdateAlertArgs,
  TeamAlertsQueryVariables,
  TeamAlertsQuery,
  TeamAlertQueryVariables,
  TeamAlertQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useTeamAlertsQuery = (
  args: TeamAlertsQueryVariables,
  options?: Partial<UseQueryOptions<TeamAlertsQuery>>,
) =>
  useQuery({
    queryKey: ["alerts", args.teamId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamAlerts($workspaceId: SweetID!, $teamId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                alerts {
                  type
                  enabled
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useTeamAlertQuery = (
  args: TeamAlertQueryVariables,
  options?: Partial<UseQueryOptions<TeamAlertQuery>>,
) =>
  useQuery({
    queryKey: ["alerts", args.teamId, args.input.type],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamAlert(
            $workspaceId: SweetID!
            $teamId: SweetID!
            $input: AlertQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                alert(input: $input) {
                  type
                  enabled
                  channel
                  settings
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useUpdateAlertMutation = (
  options?: UseMutationOptions<
    UpdateAlertMutation,
    unknown,
    MutationUpdateAlertArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpdateAlert($input: UpdateAlertInput!) {
            updateAlert(input: $input) {
              type
              enabled
            }
          }
        `),
        args,
      ),
    onSettled: (_data, __error, args) => {
      queryClient.invalidateQueries({
        queryKey: ["alerts", args.input.teamId],
      });
    },
    ...options,
  });
