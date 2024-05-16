import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  RepositoriesQuery,
  RepositoriesQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useRepositoriesQuery = (
  args: RepositoriesQueryVariables,
  options?: Partial<UseQueryOptions<RepositoriesQuery>>,
) =>
  useQuery({
    queryKey: ["repositories", args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Repositories($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              repositories {
                id
                name
                fullName
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });
