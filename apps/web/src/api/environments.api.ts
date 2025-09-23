import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  EnvironmentOptionsQuery,
  EnvironmentOptionsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useEnvironmentOptionsQuery = (
  args: EnvironmentOptionsQueryVariables,
  options?: Partial<UseQueryOptions<EnvironmentOptionsQuery>>,
) =>
  useQuery({
    queryKey: ["environments", args.workspaceId, ...Object.values(args.input)],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query EnvironmentOptions(
            $workspaceId: SweetID!
            $input: EnvironmentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              environments(input: $input) {
                id
                name
                isProduction
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });
