import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  DeploymentOptionsQuery,
  DeploymentOptionsQueryVariables,
  DeploymentsQuery,
  DeploymentsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const useDeploymentOptionsQuery = (
  args: DeploymentOptionsQueryVariables,
  options?: Partial<UseQueryOptions<DeploymentOptionsQuery>>,
) =>
  useQuery({
    queryKey: ["deployments", args.workspaceId, Object.values(args.input)],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query DeploymentOptions(
            $workspaceId: SweetID!
            $input: DeploymentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              deployments(input: $input) {
                id
                description
                version
                deployedAt
                application {
                  id
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
                author {
                  id
                  name
                  avatar
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
