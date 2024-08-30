import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  WorkspaceIntegrationsQuery,
  WorkspaceIntegrationsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

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
