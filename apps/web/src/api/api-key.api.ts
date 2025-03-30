import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { queryClient } from "./clients/query-client";
import {
  RegenerateApiKeyMutation,
  MutationRegenerateApiKeyArgs,
  WorkspaceApiKeyQuery,
  WorkspaceApiKeyQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export interface ApiKey {
  id: number;
  key: string;
  name: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const useApiKeyQuery = (
  args: WorkspaceApiKeyQueryVariables,
  options?: UseQueryOptions<WorkspaceApiKeyQuery>,
) =>
  useQuery({
    queryKey: ["apiKey"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query WorkspaceApiKey($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              apiKey {
                id
                createdAt
                lastUsedAt
                creator {
                  id
                  handle
                  name
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useRegenerateApiKeyMutation = (
  options?: UseMutationOptions<
    RegenerateApiKeyMutation,
    unknown,
    MutationRegenerateApiKeyArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation RegenerateApiKey($input: RegenerateApiKeyInput!) {
            regenerateApiKey(input: $input)
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
    },
    ...options,
  });
