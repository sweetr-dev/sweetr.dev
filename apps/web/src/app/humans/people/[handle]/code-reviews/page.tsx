import { Stack, Divider, Skeleton, Box } from "@mantine/core";
import { parseISO, format } from "date-fns";
import { Fragment } from "react";
import { LoaderInfiniteScroll } from "../../../../../components/loader-infinite-scroll";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../../../providers/pagination.provider";
import { useParams } from "react-router-dom";
import { CodeReview } from "@sweetr/graphql-types/frontend/graphql";
import { PageEmptyState } from "../../../../../components/page-empty-state";
import { CardCodeReview } from "../../../../../components/card-code-review";
import { useCodeReviewsInfiniteQuery } from "../../../../../api/code-review.api";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { parseNullableISO } from "../../../../../providers/date.provider";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { getPullRequestChanges } from "../../../../../providers/pull-request.provider";

export const PersonCodeReviewsPage = () => {
  const { workspace } = useWorkspace();
  const { handle } = useParams();

  if (!handle) throw new ResourceNotFound();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useCodeReviewsInfiniteQuery(
    {
      handle,
      input: {},
      workspaceId: workspace.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastCodeReview = lastPage.workspace.person?.codeReviews.at(-1);

        return lastCodeReview?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const codeReviews = data?.pages
    .flatMap((page) => page.workspace.person?.codeReviews)
    .filter((codeReview): codeReview is CodeReview => !!codeReview);

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(codeReviews);

  if (!codeReviews || !isFetchedAfterMount) {
    return <PageSkeleton />;
  }

  if (codeReviews.length === 0 && !isFetching) {
    return (
      <Box mt={80}>
        <PageEmptyState message="This person has no code reviews." />
      </Box>
    );
  }

  return (
    <>
      <Stack>
        {codeReviews.map((codeReview) => {
          const createdAt = parseISO(codeReview.createdAt);

          return (
            <Fragment key={codeReview.id}>
              {isFirstOfYearMonth(createdAt, codeReview.id) && (
                <Divider
                  label={format(createdAt, "MMMM yyyy")}
                  labelPosition="left"
                />
              )}
              <CardCodeReview
                title={codeReview.pullRequest.title}
                state={codeReview.state}
                createdAt={createdAt}
                comments={codeReview.commentCount}
                repositoryName={codeReview.pullRequest.repository.name}
                prGitUrl={codeReview.pullRequest.gitUrl}
                prComments={codeReview.pullRequest.commentCount}
                prSize={codeReview.pullRequest.tracking.size}
                prFirstReviewAt={parseNullableISO(
                  codeReview.pullRequest.tracking.firstReviewAt,
                )}
                prTimeToFirstReview={
                  codeReview.pullRequest.tracking.timeToFirstReview || undefined
                }
                prAuthor={{
                  name:
                    codeReview.pullRequest.author.name ||
                    codeReview.pullRequest.author.handle,
                  avatar: codeReview.pullRequest.author.avatar || undefined,
                }}
                prChanges={getPullRequestChanges(codeReview.pullRequest)}
              />
            </Fragment>
          );
        })}

        {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
      </Stack>
    </>
  );
};

const PageSkeleton = (): JSX.Element => (
  <Stack>
    <Skeleton height={20} />
    <Skeleton height={80} />
    <Skeleton height={80} />
    <Skeleton height={80} />
    <Skeleton height={80} />
    <Skeleton height={80} />
    <Skeleton height={80} />
  </Stack>
);
