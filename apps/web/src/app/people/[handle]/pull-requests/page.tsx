import { Stack, Divider, Skeleton, Box } from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import { parseISO, format } from "date-fns";
import { Fragment } from "react";
import { LoaderInfiniteScroll } from "../../../../components/loader-infinite-scroll";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../../providers/pagination.provider";
import { useOutletContext } from "react-router-dom";
import {
  PullRequest,
  PullRequestOwnerType,
} from "@sweetr/graphql-types/frontend/graphql";
import { usePullRequestsInfiniteQuery } from "../../../../api/pull-request.api";
import { PageEmptyState } from "../../../../components/page-empty-state";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { LoadableContent } from "../../../../components/loadable-content";

export const PersonPullRequestsPage = () => {
  const { workspace } = useWorkspace();
  const { personId } = useOutletContext<{ personId: string }>();

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
        ownerIds: [personId],
        ownerType: PullRequestOwnerType.PERSON,
      },
      workspaceId: workspace.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastPullRequest = lastPage.workspace.pullRequests.at(-1);

        return lastPullRequest?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const pullRequests = data?.pages
    .flatMap((page) => page.workspace.pullRequests)
    .filter((pullRequest): pullRequest is PullRequest => !!pullRequest);

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(pullRequests);

  const isLoading =
    (isFetching && !pullRequests) ||
    (isFetchedAfterMount &&
      isFetching &&
      (pullRequests?.length === 0 || !pullRequests));
  const isEmpty = !!(pullRequests && pullRequests.length === 0 && !isLoading);

  return (
    <LoadableContent
      isEmpty={isEmpty}
      isLoading={isLoading}
      whenLoading={
        <Stack>
          <Skeleton height={20} />
          <Skeleton height={85} />
          <Skeleton height={85} />
          <Skeleton height={85} />
          <Skeleton height={85} />
          <Skeleton height={85} />
          <Skeleton height={85} />
        </Stack>
      }
      whenEmpty={
        <Box mt={80}>
          <PageEmptyState message="This person has no pull requests." />
        </Box>
      }
      content={
        <Stack>
          {pullRequests?.map((pr) => {
            const createdAt = parseISO(pr.createdAt);

            return (
              <Fragment key={pr.id}>
                {isFirstOfYearMonth(createdAt, pr.id) && (
                  <Divider
                    label={format(createdAt, "MMMM yyyy")}
                    labelPosition="left"
                  />
                )}
                <CardPullRequest pullRequest={pr} />
              </Fragment>
            );
          })}
          {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
        </Stack>
      }
    />
  );
};
