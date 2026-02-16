import { useForm } from "@mantine/form";
import {
  PullRequest,
  PullRequestOwnerType,
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { usePullRequestsInfiniteQuery } from "../api/pull-request.api";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "./pagination.provider";
import { FilterOption, useFilterSearchParameters } from "./filter.provider";
import { useWorkspace } from "./workspace.provider";

interface UsePullRequestListOptions {
  ownerIds: string[];
  ownerType?: PullRequestOwnerType;
}

export const usePullRequestList = ({
  ownerIds,
  ownerType = PullRequestOwnerType.TEAM,
}: UsePullRequestListOptions) => {
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
        ownerIds,
        ownerType,
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

  const { ref: infiniteScrollRef } = useInfiniteLoading({
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

  const handleStateChange = (states: string[]) => {
    filters.setFieldValue("states", states as PullRequestState[]);
    searchParams.set("state", states);
  };

  const handleSizeChange = (sizes: string[]) => {
    filters.setFieldValue("sizes", sizes as PullRequestSize[]);
    searchParams.set("size", sizes);
  };

  const handleCreatedAtChange = (dates: [Date | null, Date | null]) => {
    const createdAtFrom = dates[0]?.toISOString() || null;
    const createdAtTo = dates[1]?.toISOString() || null;

    filters.setFieldValue("createdAtFrom", createdAtFrom);
    filters.setFieldValue("createdAtTo", createdAtTo);
    searchParams.set("createdAtFrom", createdAtFrom);
    searchParams.set("createdAtTo", createdAtTo);
  };

  const handleCompletedAtChange = (dates: [Date | null, Date | null]) => {
    const completedAtFrom = dates[0]?.toISOString() || null;
    const completedAtTo = dates[1]?.toISOString() || null;

    filters.setFieldValue("completedAtFrom", completedAtFrom);
    filters.setFieldValue("completedAtTo", completedAtTo);
    searchParams.set("completedAtFrom", completedAtFrom);
    searchParams.set("completedAtTo", completedAtTo);

    if (completedAtFrom) {
      const selectedCompletedStates = filters.values.states.filter((state) =>
        completedStates.includes(state as PullRequestState),
      );

      handleStateChange(selectedCompletedStates);
    }
  };

  const resetFilters = () => {
    filters.setValues({
      states: [],
      sizes: [],
      createdAtFrom: null,
      createdAtTo: null,
      completedAtFrom: null,
      completedAtTo: null,
    });
    searchParams.reset();
  };

  return {
    pullRequests,
    isLoading,
    isEmpty,
    isFiltering,
    hasNextPage,
    infiniteScrollRef,
    isFirstOfYearMonth,
    filterValues: filters.values,
    possibleStates,
    handleStateChange,
    handleSizeChange,
    handleCreatedAtChange,
    handleCompletedAtChange,
    resetFilters,
    searchParams,
  };
};
