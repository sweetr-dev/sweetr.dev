import { Stack, Divider, Skeleton, Box, Group } from "@mantine/core";
import { CardPullRequest } from "../../../../../components/card-pull-request";
import { parseISO } from "date-fns";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../../../providers/pagination.provider";
import { LoaderInfiniteScroll } from "../../../../../components/loader-infinite-scroll";
import {
  PullRequest,
  PullRequestOwnerType,
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { Fragment } from "react";
import { format } from "date-fns";
import { usePullRequestsInfiniteQuery } from "../../../../../api/pull-request.api";
import { PageEmptyState } from "../../../../../components/page-empty-state";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { parseNullableISO } from "../../../../../providers/date.provider";
import {
  IconCalendarFilled,
  IconRuler,
  IconStatusChange,
} from "@tabler/icons-react";
import { FilterMultiSelect } from "../../../../../components/filter-multi-select";
import { useForm } from "@mantine/form";
import { LoadableContent } from "../../../../../components/loadable-content/loadable-content";
import { FilterDate } from "../../../../../components/filter-date";
import {
  FilterOption,
  useFilterSearchParameters,
} from "../../../../../providers/filter.provider";
import { useTeamId } from "../use-team";

export const TeamPullRequestsPage = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    states: PullRequestState[];
    sizes: PullRequestSize[];
    createdAtFrom: string | null;
    createdAtTo: string | null;
    completedAtFrom: string | null;
    completedAtTo: string | null;
  }>({
    initialValues: {
      states: searchParams.getAll<PullRequestState[]>("state") || [],
      sizes: searchParams.getAll<PullRequestSize[]>("size") || [],
      createdAtFrom: searchParams.get("createdAtFrom"),
      createdAtTo: searchParams.get("createdAtTo"),
      completedAtFrom: searchParams.get("completedAtFrom"),
      completedAtTo: searchParams.get("completedAtTo"),
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
        completedAt: {
          from: filters.values.completedAtFrom,
          to: filters.values.completedAtTo,
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

  const completedStates = [PullRequestState.CLOSED, PullRequestState.MERGED];

  const possibleStates: FilterOption[] = filters.values.completedAtFrom
    ? completedStates.map((state) => ({
        label: state,
        value: state,
      }))
    : Object.values(PullRequestState).map((state) => ({
        label: state,
        value: state,
      }));

  const handleStateChange = (states: PullRequestState[]) => {
    filters.setFieldValue("states", states);
    searchParams.set("state", states);
  };

  return (
    <>
      <Group gap={5}>
        <FilterDate
          label="Created"
          icon={IconCalendarFilled}
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
        <FilterDate
          label="Completed"
          icon={IconCalendarFilled}
          onChange={(dates) => {
            const completedAtFrom = dates[0]?.toISOString() || null;
            const completedAtTo = dates[1]?.toISOString() || null;

            filters.setFieldValue("completedAtFrom", completedAtFrom);
            filters.setFieldValue("completedAtTo", completedAtTo);
            searchParams.set("completedAtFrom", completedAtFrom);
            searchParams.set("completedAtTo", completedAtTo);

            if (completedAtFrom) {
              const selectedCompletedStates = filters.values.states.filter(
                (state) => completedStates.includes(state as PullRequestState),
              );

              handleStateChange(selectedCompletedStates);
            }
          }}
          value={[
            parseNullableISO(filters.values.completedAtFrom) || null,
            parseNullableISO(filters.values.completedAtTo) || null,
          ]}
          clearable
        />
        <FilterMultiSelect
          width="target"
          label="State"
          icon={IconStatusChange}
          items={possibleStates}
          onChange={(states) => {
            filters.setFieldValue("states", states as PullRequestState[]);
            searchParams.set("state", states);
          }}
          value={filters.values.states}
          capitalize
        />
        <FilterMultiSelect
          width="target"
          label="Size"
          icon={IconRuler}
          items={Object.values(PullRequestSize).map((size) => ({
            label: size,
            value: size,
          }))}
          onChange={(sizes) => {
            filters.setFieldValue("sizes", sizes as PullRequestSize[]);
            searchParams.set("size", sizes);
          }}
          value={filters.values.sizes}
          capitalize
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
                filters.setValues({
                  states: [],
                  sizes: [],
                  createdAtFrom: null,
                  createdAtTo: null,
                });
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
                  <CardPullRequest pullRequest={pr} />
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
