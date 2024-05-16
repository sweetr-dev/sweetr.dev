import { Box, BoxProps, Button, Skeleton, Stack } from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import {
  PullRequest,
  PullRequestOwnerType,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { usePullRequestsInfiniteQuery } from "../../../../api/pull-request.api";
import { useAuthenticatedUser } from "../../../../providers/auth.provider";
import { parseISO } from "date-fns";
import { parseNullableISO } from "../../../../providers/date.provider";
import { LoadableContent } from "../../../../components/loadable-content";
import { PageEmptyState } from "../../../../components/page-empty-state";
import { IconMoodCheck } from "@tabler/icons-react";
import { useTeammatesQuery } from "../../../../api/teams.api";

export const TeamOpenPullRequests = (props: BoxProps) => {
  const { user } = useAuthenticatedUser();
  const { workspace } = useWorkspace();

  const { data: teammatesData } = useTeammatesQuery({
    workspaceId: workspace.id,
    handle: user.handle,
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = usePullRequestsInfiniteQuery(
    {
      input: {
        ownerIds:
          teammatesData?.workspace.person?.teammates.map(
            (teammate) => teammate.person.id,
          ) || [],
        ownerType: PullRequestOwnerType.PERSON,
        states: [PullRequestState.OPEN],
      },
      workspaceId: workspace.id,
    },
    {
      enabled: !!teammatesData,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastPullRequest = lastPage.workspace.pullRequests.at(-1);

        if (lastPage.workspace.pullRequests.length < 10) return undefined;

        return lastPullRequest?.id || undefined;
      },
    },
  );

  const pullRequests = data?.pages
    .flatMap((page) => page.workspace.pullRequests)
    .filter((pullRequest): pullRequest is PullRequest => !!pullRequest);

  const isLoading =
    (isFetching && !pullRequests) ||
    (isFetchedAfterMount &&
      isFetching &&
      (pullRequests?.length === 0 || !pullRequests));

  const isEmpty = !!(pullRequests && pullRequests.length === 0 && !isLoading);

  return (
    <LoadableContent
      {...props}
      isLoading={isLoading}
      isEmpty={isEmpty}
      whenEmpty={
        <Box mt="lg">
          <PageEmptyState
            message="Sweet, there are no PRs waiting."
            icon={IconMoodCheck}
          />
        </Box>
      }
      whenLoading={
        <Stack>
          <Skeleton height={85} />
          <Skeleton height={85} />
        </Stack>
      }
      content={
        <Stack {...props}>
          {pullRequests?.map((pr) => {
            const createdAt = parseISO(pr.createdAt);

            return (
              <CardPullRequest
                key={pr.id}
                title={pr.title}
                state={pr.state}
                url={pr.gitUrl}
                repositoryName={pr.repository.name}
                createdAt={createdAt}
                closedAt={parseNullableISO(pr.closedAt)}
                mergedAt={parseNullableISO(pr.mergedAt)}
                firstReviewAt={parseNullableISO(pr.tracking.firstReviewAt)}
                size={pr.tracking.size}
                timeToFirstReview={pr.tracking.timeToFirstReview || undefined}
                timeToFirstApproval={
                  pr.tracking.timeToFirstApproval || undefined
                }
                timeToMerge={pr.tracking.timeToMerge || undefined}
                author={{
                  name: pr.author.name!,
                  avatar: pr.author.avatar!,
                }}
                comments={pr.commentCount}
                changes={{
                  additions: pr.linesAddedCount,
                  deletions: pr.linesDeletedCount,
                  files: pr.changedFilesCount,
                }}
              />
            );
          })}
          {hasNextPage && (
            <Box ta="center">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={() => {
                  fetchNextPage();
                }}
                loading={isFetchingNextPage}
              >
                Load more
              </Button>
            </Box>
          )}
        </Stack>
      }
    />
  );
};
