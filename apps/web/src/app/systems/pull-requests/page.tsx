import { Stack, Divider, Skeleton, Box, Group } from "@mantine/core";
import { CardPullRequest } from "../../../components/card-pull-request";
import { parseISO } from "date-fns";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { Fragment, useState } from "react";
import { format } from "date-fns";
import { PageEmptyState } from "../../../components/page-empty-state";
import { parseNullableISO } from "../../../providers/date.provider";
import {
  IconCalendarFilled,
  IconRuler,
  IconStatusChange,
} from "@tabler/icons-react";
import { LoadableContent } from "../../../components/loadable-content/loadable-content";
import { FilterDate } from "../../../components/filter-date";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { IconTeam } from "../../../providers/icon.provider";
import { useTeamAsyncOptions } from "../../../providers/async-options.provider";
import { PageContainer } from "../../../components/page-container";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { usePullRequestList } from "../../../providers/pull-request-list.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";

export const SystemsPullRequestsPage = () => {
  const teamSearchParams = useFilterSearchParameters();
  const [teamIds, setTeamIds] = useState<string[]>(
    teamSearchParams.getAll<string[]>("team") || [],
  );

  const {
    pullRequests,
    isLoading,
    isEmpty,
    isFiltering,
    hasNextPage,
    infiniteScrollRef,
    isFirstOfYearMonth,
    filterValues,
    possibleStates,
    handleStateChange,
    handleSizeChange,
    handleCreatedAtChange,
    handleCompletedAtChange,
    resetFilters,
    searchParams,
  } = usePullRequestList({ ownerIds: teamIds });

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Pull Requests" }]} />

      <Group gap={5}>
        <FilterDate
          label="Created"
          icon={IconCalendarFilled}
          onChange={handleCreatedAtChange}
          value={[
            parseNullableISO(filterValues.createdAtFrom) || null,
            parseNullableISO(filterValues.createdAtTo) || null,
          ]}
        />
        <FilterDate
          label="Completed"
          icon={IconCalendarFilled}
          onChange={handleCompletedAtChange}
          value={[
            parseNullableISO(filterValues.completedAtFrom) || null,
            parseNullableISO(filterValues.completedAtTo) || null,
          ]}
          clearable
        />

        <FilterMultiSelect
          label="Team"
          icon={IconTeam}
          asyncController={useTeamAsyncOptions}
          withSearch
          value={teamIds}
          onChange={(value) => {
            setTeamIds(value);
            searchParams.set("team", value);
          }}
        />

        <FilterMultiSelect
          width="target"
          label="State"
          icon={IconStatusChange}
          items={possibleStates}
          onChange={handleStateChange}
          value={filterValues.states}
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
          onChange={handleSizeChange}
          value={filterValues.sizes}
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
              message="No Pull Requests found."
              isFiltering={isFiltering || searchParams.hasAny}
              onResetFilter={() => {
                resetFilters();
                setTeamIds([]);
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
            {hasNextPage && <LoaderInfiniteScroll ref={infiniteScrollRef} />}
          </Stack>
        }
      />
    </PageContainer>
  );
};
