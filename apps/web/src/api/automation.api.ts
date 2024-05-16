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

export const useWorkspaceAutomationQuery = (
  args: WorkspaceAutomationQueryVariables,
  options?: Partial<UseQueryOptions<WorkspaceAutomationQuery>>,
) =>
  useQuery({
    queryKey: ["automations", args.input.slug, args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceAutomation(
            $workspaceId: SweetID!
            $input: AutomationQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              automation(input: $input) {
                slug
                scope
                enabled
                title
                description
                demoUrl
                docsUrl
                color
                icon
                benefits {
                  techDebt
                  failureRate
                  security
                  cycleTime
                  compliance
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useWorkspaceAutomationsQuery = (
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
                slug
                scope
                enabled
                title
                description
                shortDescription
                demoUrl
                docsUrl
                color
                icon
                benefits {
                  techDebt
                  failureRate
                  security
                  cycleTime
                  compliance
                }
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
              slug
              enabled
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
