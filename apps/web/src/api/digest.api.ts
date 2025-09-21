import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  TeamDigestsQueryVariables,
  TeamDigestsQuery,
  TeamDigestQuery,
  TeamDigestQueryVariables,
  UpdateDigestMutation,
  MutationUpdateDigestArgs,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useTeamDigestsQuery = (
  args: TeamDigestsQueryVariables,
  options?: Partial<UseQueryOptions<TeamDigestsQuery>>,
) =>
  useQuery({
    queryKey: ["digests", args.teamId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamDigests($workspaceId: SweetID!, $teamId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                digests {
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

export const useTeamDigestQuery = (
  args: TeamDigestQueryVariables,
  options?: Partial<UseQueryOptions<TeamDigestQuery>>,
) =>
  useQuery({
    queryKey: ["digests", args.teamId, args.input.type],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamDigest(
            $workspaceId: SweetID!
            $teamId: SweetID!
            $input: DigestQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                digest(input: $input) {
                  type
                  enabled
                  channel
                  frequency
                  dayOfTheWeek
                  timeOfDay
                  timezone
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

export const useUpdateDigestMutation = (
  options?: UseMutationOptions<
    UpdateDigestMutation,
    unknown,
    MutationUpdateDigestArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpdateDigest($input: UpdateDigestInput!) {
            updateDigest(input: $input) {
              type
              enabled
            }
          }
        `),
        args,
      ),
    onSettled: (_data, __error, args) => {
      queryClient.invalidateQueries({
        queryKey: ["digests", args.input.teamId],
      });
    },
    ...options,
  });
