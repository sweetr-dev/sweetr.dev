import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  InstallIntegrationMutation,
  MutationInstallIntegrationArgs,
  MutationRemoveIntegrationArgs,
  MutationSendTestMessageArgs,
  RemoveIntegrationMutation,
  SendTestMessageMutation,
  WorkspaceIntegrationsQuery,
  WorkspaceIntegrationsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useIntegrationsQuery = (
  args: WorkspaceIntegrationsQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceIntegrationsQuery>>,
) =>
  useQuery({
    queryKey: ["integrations", args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceIntegrations($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              integrations {
                app
                isEnabled
                installUrl
                enabledAt
                target
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useInstallIntegrationMutation = (
  options?: UseMutationOptions<
    InstallIntegrationMutation,
    unknown,
    MutationInstallIntegrationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation InstallIntegration($input: InstallIntegrationInput!) {
            installIntegration(input: $input)
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations"],
      });
    },
    ...options,
  });

export const useRemoveIntegrationMutation = (
  options?: UseMutationOptions<
    RemoveIntegrationMutation,
    unknown,
    MutationRemoveIntegrationArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation RemoveIntegration($input: RemoveIntegrationInput!) {
            removeIntegration(input: $input)
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations"],
      });
    },
    ...options,
  });

export const useSendTestMessageMutation = (
  options?: UseMutationOptions<
    SendTestMessageMutation,
    unknown,
    MutationSendTestMessageArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation SendTestMessage($input: SendTestMessageInput!) {
            sendTestMessage(input: $input)
          }
        `),
        args,
      ),
    ...options,
  });
