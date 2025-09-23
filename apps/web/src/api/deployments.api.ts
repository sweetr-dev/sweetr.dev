import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  DeploymentsQuery,
  DeploymentsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const useDeploymentsInfiniteQuery = (
  args: DeploymentsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      DeploymentsQuery,
      DefaultError,
      InfiniteData<DeploymentsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: [
      "deployments",
      args.workspaceId,
      args.input.cursor,
      ...Object.values(args.input),
    ],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Deployments(
            $workspaceId: SweetID!
            $input: DeploymentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              deployments(input: $input) {
                id
                application {
                  id
                  name
                }
                environment {
                  name
                  isProduction
                }
                version
                description
                deployedAt
                archivedAt
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
