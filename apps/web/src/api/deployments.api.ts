import { graphql } from "@sweetr/graphql-types/frontend";
import {
  ArchiveDeploymentMutation,
  DeploymentOptionsQuery,
  DeploymentOptionsQueryVariables,
  DeploymentQuery,
  DeploymentQueryVariables,
  DeploymentsQuery,
  DeploymentsQueryVariables,
  MutationArchiveDeploymentArgs,
  MutationUnarchiveDeploymentArgs,
  UnarchiveDeploymentMutation,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { Optional } from "utility-types";
import { graphQLClient } from "./clients/graphql-client";
import { queryClient } from "./clients/query-client";

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
                pullRequestCount
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });

export const useDeploymentQuery = (
  args: DeploymentQueryVariables,
  options?: Partial<UseQueryOptions<DeploymentQuery>>,
) =>
  useQuery({
    queryKey: ["deployment", args.workspaceId, args.deploymentId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Deployment($workspaceId: SweetID!, $deploymentId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              deployment(deploymentId: $deploymentId) {
                id
                application {
                  id
                  name
                  repository {
                    fullName
                  }
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
                pullRequests {
                  id
                  title
                  gitUrl
                  commentCount
                  changedFilesCount
                  linesAddedCount
                  linesDeletedCount
                  state
                  createdAt
                  mergedAt
                  closedAt
                  tracking {
                    size
                    changedFilesCount
                    linesAddedCount
                    linesDeletedCount
                    timeToCode
                    timeToFirstReview
                    timeToFirstApproval
                    timeToMerge
                    timeToDeploy
                    firstReviewAt
                    firstApprovalAt
                    firstDeployedAt
                    cycleTime
                  }
                  author {
                    id
                    avatar
                    handle
                    name
                  }
                  repository {
                    id
                    name
                    fullName
                  }
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useArchiveDeployment = (
  options?: UseMutationOptions<
    ArchiveDeploymentMutation,
    unknown,
    MutationArchiveDeploymentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ArchiveDeployment($input: ArchiveDeploymentInput!) {
            archiveDeployment(input: $input) {
              id
              version
              description
              deployedAt
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
    ...options,
  });

export const useUnarchiveDeployment = (
  options?: UseMutationOptions<
    UnarchiveDeploymentMutation,
    unknown,
    MutationUnarchiveDeploymentArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UnarchiveDeployment($input: UnarchiveDeploymentInput!) {
            unarchiveDeployment(input: $input) {
              id
              version
              description
              deployedAt
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
    ...options,
  });
