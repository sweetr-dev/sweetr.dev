import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  MutationUpsertTeamArgs,
  TeamsQuery,
  TeamQuery,
  TeamQueryVariables,
  TeamsQueryVariables,
  UpsertTeamMutation,
  ArchiveTeamMutation,
  MutationArchiveTeamArgs,
  UnarchiveTeamMutation,
  MutationUnarchiveTeamArgs,
  TeammatesQuery,
  TeammatesQueryVariables,
  TeamPullRequestsInProgressQueryVariables,
  TeamPullRequestsInProgressQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { queryClient } from "./clients/query-client";

export const useTeamsQuery = (
  args: TeamsQueryVariables,
  options?: Partial<UseQueryOptions<TeamsQuery>>,
) =>
  useQuery({
    queryKey: ["teams", args.workspaceId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Teams($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              teams {
                id
                name
                description
                icon
                startColor
                endColor
                archivedAt
                members {
                  id
                  person {
                    id
                    avatar
                    handle
                    name
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

export const useTeamQuery = (
  args: TeamQueryVariables,
  options?: Partial<UseQueryOptions<TeamQuery>>,
) =>
  useQuery({
    queryKey: ["team", args.workspaceId, args.teamId],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Team($workspaceId: SweetID!, $teamId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              team(teamId: $teamId) {
                id
                name
                description
                icon
                startColor
                endColor
                archivedAt
                members {
                  id
                  role
                  person {
                    id
                    avatar
                    handle
                    name
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

export const useTeamPullRequestsInProgressQuery = (
  args: TeamPullRequestsInProgressQueryVariables,
  options?: UseQueryOptions<TeamPullRequestsInProgressQuery>,
) =>
  useQuery({
    queryKey: [
      "team",
      "pull-requests-in-progress",
      args.workspaceId,
      args.teamId,
    ],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query TeamPullRequestsInProgress(
            $workspaceId: SweetID!
            $teamId: SweetID!
          ) {
            workspace(workspaceId: $workspaceId) {
              id
              team(teamId: $teamId) {
                id
                pullRequestsInProgress {
                  drafted {
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
                      timeToFirstReview
                      timeToMerge
                      timeToFirstApproval
                      firstReviewAt
                      firstApprovalAt
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
                  pendingReview {
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
                      timeToFirstReview
                      timeToMerge
                      timeToFirstApproval
                      firstReviewAt
                      firstApprovalAt
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
                  changesRequested {
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
                      timeToFirstReview
                      timeToMerge
                      timeToFirstApproval
                      firstReviewAt
                      firstApprovalAt
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
                  pendingMerge {
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
                      timeToFirstReview
                      timeToMerge
                      timeToFirstApproval
                      firstReviewAt
                      firstApprovalAt
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
          }
        `),
        args,
      ),
    ...options,
  });

export const useTeammatesQuery = (
  args: TeammatesQueryVariables,
  options?: Partial<UseQueryOptions<TeammatesQuery>>,
) =>
  useQuery({
    queryKey: ["teammates", args.workspaceId, args.handle],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Teammates($workspaceId: SweetID!, $handle: String!) {
            workspace(workspaceId: $workspaceId) {
              person(handle: $handle) {
                id
                teammates {
                  id
                  person {
                    id
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

export const useUpsertTeamMutation = (
  options?: UseMutationOptions<
    UpsertTeamMutation,
    unknown,
    MutationUpsertTeamArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UpsertTeam($input: UpsertTeamInput!) {
            upsertTeam(input: $input) {
              id
              name
              description
              icon
              startColor
              endColor
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    ...options,
  });

export const useArchiveTeam = (
  options?: UseMutationOptions<
    ArchiveTeamMutation,
    unknown,
    MutationArchiveTeamArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation ArchiveTeam($input: ArchiveTeamInput!) {
            archiveTeam(input: $input) {
              id
              name
              description
              icon
              startColor
              endColor
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    ...options,
  });

export const useUnarchiveTeam = (
  options?: UseMutationOptions<
    UnarchiveTeamMutation,
    unknown,
    MutationUnarchiveTeamArgs,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation UnarchiveTeam($input: UnarchiveTeamInput!) {
            unarchiveTeam(input: $input) {
              id
              name
              description
              icon
              startColor
              endColor
              archivedAt
            }
          }
        `),
        args,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    ...options,
  });
