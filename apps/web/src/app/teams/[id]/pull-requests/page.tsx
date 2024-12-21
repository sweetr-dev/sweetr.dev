import { Stack, Divider, Skeleton, Box, Group } from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import { parseISO } from "date-fns";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../../providers/pagination.provider";
import { LoaderInfiniteScroll } from "../../../../components/loader-infinite-scroll";
import {
  PullRequest,
  PullRequestOwnerType,
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { Fragment } from "react";
import { format } from "date-fns";
import { usePullRequestsInfiniteQuery } from "../../../../api/pull-request.api";
import { PageEmptyState } from "../../../../components/page-empty-state";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { parseNullableISO } from "../../../../providers/date.provider";
import {
  IconAspectRatio,
  IconCalendar,
  IconStatusChange,
} from "@tabler/icons-react";
import { FilterMultiSelect } from "../../../../components/filter-multi-select";
import { useForm } from "@mantine/form";
import { LoadableContent } from "../../../../components/loadable-content/loadable-content";
import { FilterDate } from "../../../../components/filter-date";
import { useFilterSearchParameters } from "../../../../providers/filter.provider";
import { useTeamId } from "../use-team";
import { getPullRequestChanges } from "../../../../providers/pull-request.provider";

export const TeamPullRequestsPage = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    states: PullRequestState[];
    sizes: PullRequestSize[];
    createdAtFrom: string | null;
    createdAtTo: string | null;
  }>({
    initialValues: {
      states: searchParams.getAll<PullRequestState[]>("states") || [],
      sizes: searchParams.getAll<PullRequestSize[]>("sizes") || [],
      createdAtFrom: searchParams.get("createdAtFrom"),
      createdAtTo: searchParams.get("createdAtTo"),
    },
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
        ownerIds: [teamId],
        ownerType: PullRequestOwnerType.TEAM,
        states: filters.values.states,
        sizes: filters.values.sizes,
        createdAt: {
          from: filters.values.createdAtFrom,
          to: filters.values.createdAtTo,
        },
      },
      workspaceId: workspace?.id,
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
  const isFiltering = Object.keys(searchParams.values).length > 0;

  return (
    <>
      <Group gap={5}>
        <FilterDate
          label="Created"
          icon={IconCalendar}
          onChange={(dates) => {
            const createdAtFrom = dates[0]?.toISOString() || null;
            const createdAtTo = dates[1]?.toISOString() || null;

            filters.setFieldValue("createdAtFrom", createdAtFrom);
            filters.setFieldValue("createdAtTo", createdAtTo);
            searchParams.set("createdAtFrom", createdAtFrom);
            searchParams.set("createdAtTo", createdAtTo);
          }}
          value={[
            parseNullableISO(filters.values.createdAtFrom) || null,
            parseNullableISO(filters.values.createdAtTo) || null,
          ]}
        />
        <FilterMultiSelect
          label="State"
          icon={IconStatusChange}
          items={Object.values(PullRequestState)}
          onChange={(states) => {
            filters.setFieldValue("states", states as PullRequestState[]);
            searchParams.set("states", states);
          }}
          value={filters.values.states}
        />
        <FilterMultiSelect
          label="Size"
          icon={IconAspectRatio}
          items={Object.values(PullRequestSize)}
          onChange={(sizes) => {
            filters.setFieldValue("sizes", sizes as PullRequestSize[]);
            searchParams.set("sizes", sizes);
          }}
          value={filters.values.sizes}
        />
      </Group>

      <LoadableContent
        mt="md"
        isLoading={isLoading}
        isEmpty={isEmpty}
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
            <PageEmptyState
              message="This team has no pull requests."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.reset();
                searchParams.reset();
              }}
            />
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
                  <CardPullRequest
                    title={pr.title}
                    state={pr.state}
                    url={pr.gitUrl}
                    repositoryName={pr.repository.name}
                    createdAt={createdAt}
                    closedAt={parseNullableISO(pr.closedAt)}
                    mergedAt={parseNullableISO(pr.mergedAt)}
                    firstReviewAt={parseNullableISO(pr.tracking.firstReviewAt)}
                    size={pr.tracking.size}
                    timeToFirstReview={
                      pr.tracking.timeToFirstReview || undefined
                    }
                    timeToFirstApproval={
                      pr.tracking.timeToFirstApproval || undefined
                    }
                    timeToMerge={pr.tracking.timeToMerge || undefined}
                    author={{
                      name: pr.author.name!,
                      avatar: pr.author.avatar!,
                    }}
                    comments={pr.commentCount}
                    changes={getPullRequestChanges(pr)}
                  />
                </Fragment>
              );
            })}
            {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
          </Stack>
        }
      />
    </>
  );
};
