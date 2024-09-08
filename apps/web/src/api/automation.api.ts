import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  MutationUpdateAutomationArgs,
  UpdateAutomationMutation,
  WorkspaceAutomationQuery,
  WorkspaceAutomationQueryVariables,
  WorkspaceAutomationsQuery,
  WorkspaceAutomationsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useAutomationQuery = (
  args: WorkspaceAutomationQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceAutomationQuery>>,
) =>
  useQuery({
    queryKey: ["automations", args.input.type, args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceAutomation(
            $workspaceId: SweetID!
            $input: AutomationQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              automation(input: $input) {
                type
                enabled
                settings
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useAutomationsQuery = (
  args: WorkspaceAutomationsQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceAutomationsQuery>>,
) =>
  useQuery({
    queryKey: ["automations", args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceAutomations($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              automations {
                type
                enabled
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useUpdateAutomationMutation = (
  options?: UseMutationOptions<
    UpdateAutomationMutation,
    unknown,
    MutationUpdateAutomationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpdateAutomation($input: UpdateAutomationInput!) {
            updateAutomation(input: $input) {
              type
              enabled
              settings
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
    ...options,
  });
