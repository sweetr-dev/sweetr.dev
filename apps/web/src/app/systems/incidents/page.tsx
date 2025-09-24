import { Box, Divider, Group, Skeleton, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconBox, IconCalendarFilled, IconServer } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Fragment } from "react/jsx-runtime";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterDate } from "../../../components/filter-date";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import { parseNullableISO } from "../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import {
  useListGroupedByYearMonth,
  useInfiniteLoading,
} from "../../../providers/pagination.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import {
  useApplicationAsyncOptions,
  useEnvironmentAsyncOptions,
} from "../../../providers/async-options.provider";
import { useIncidentsInfiniteQuery } from "../../../api/incidents.api";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { CardIncident } from "./components/card-incident";
import { Incident } from "@sweetr/graphql-types/frontend/graphql";

export const IncidentsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    detectedAtFrom: string | null;
    detectedAtTo: string | null;
    applicationIds: string[];
    environmentIds: string[];
  }>({
    initialValues: {
      detectedAtFrom: searchParams.get("detectedAtFrom"),
      detectedAtTo: searchParams.get("detectedAtTo"),
      applicationIds: searchParams.getAll("application"),
      environmentIds: searchParams.getAll("environment"),
    },
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useIncidentsInfiniteQuery(
    {
      input: {
        detectedAt: {
          from: filters.values.detectedAtFrom,
          to: filters.values.detectedAtTo,
        },
        applicationIds: filters.values.applicationIds,
        environmentIds: filters.values.environmentIds,
      },
      workspaceId: workspace?.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastIncident = lastPage.workspace.incidents.at(-1);

        return lastIncident?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const incidents = data?.pages
    .flatMap((page) => page.workspace.incidents)
    .filter((incident): incident is Incident => !!incident);

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(
    incidents,
    (incident) => incident.detectedAt,
  );

  const isLoading =
    (isFetching && !incidents) ||
    (isFetchedAfterMount &&
      isFetching &&
      (incidents?.length === 0 || !incidents));
  const isEmpty = !!(incidents && incidents.length === 0 && !isLoading);
  const isFiltering = Object.keys(searchParams.values).length > 0;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Incidents" }]} />

      <Group gap={5}>
        <FilterDate
          label="Detected"
          icon={IconCalendarFilled}
          onChange={(dates) => {
            const detectedAtFrom = dates[0]?.toISOString() || null;
            const detectedAtTo = dates[1]?.toISOString() || null;

            filters.setFieldValue("detectedAtFrom", detectedAtFrom);
            filters.setFieldValue("detectedAtTo", detectedAtTo);
            searchParams.set("detectedAtFrom", detectedAtFrom);
            searchParams.set("detectedAtTo", detectedAtTo);
          }}
          value={[
            parseNullableISO(filters.values.detectedAtFrom) || null,
            parseNullableISO(filters.values.detectedAtTo) || null,
          ]}
          clearable
        />
        <FilterMultiSelect
          label="Application"
          icon={IconBox}
          asyncController={useApplicationAsyncOptions}
          withSearch
          value={filters.values.applicationIds}
          onChange={(value) => {
            filters.setFieldValue("applicationIds", value);
            searchParams.set("application", value);
          }}
          capitalize={false}
        />
        <FilterMultiSelect
          label="Environment"
          icon={IconServer}
          asyncController={useEnvironmentAsyncOptions}
          withSearch
          value={filters.values.environmentIds}
          capitalize={false}
          onChange={(value) => {
            filters.setFieldValue("environmentIds", value);
            searchParams.set("environment", value);
          }}
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
              message="No incidents found."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.setValues({
                  detectedAtFrom: null,
                  detectedAtTo: null,
                  applicationIds: [],
                  environmentIds: [],
                });
                searchParams.reset();
              }}
            />
          </Box>
        }
        content={
          <Stack>
            <Box
              display="grid"
              style={{
                justifyContent: "space-between",
                gap: "var(--stack-gap, var(--mantine-spacing-md))",
              }}
            >
              {incidents?.map((incident) => {
                const detectedAt = parseISO(incident.detectedAt);

                return (
                  <Fragment key={incident.id}>
                    {isFirstOfYearMonth(detectedAt, incident.id) && (
                      <Divider
                        label={format(detectedAt, "MMMM yyyy")}
                        labelPosition="left"
                        style={{
                          gridColumn: "span 4",
                        }}
                      />
                    )}
                    <CardIncident incident={incident} />
                  </Fragment>
                );
              })}
            </Box>
            {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
          </Stack>
        }
      />
    </PageContainer>
  );
};
