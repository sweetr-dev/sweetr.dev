import { Box, Divider, Group, Skeleton, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";
import { IconBox, IconCalendarFilled, IconServer } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Outlet } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import { useDeploymentsInfiniteQuery } from "../../../api/deployments.api";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterDate } from "../../../components/filter-date";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import {
  FilterArchivedOnly,
  FilterOptions,
} from "../../../components/filter-options";
import { LoadableContent } from "../../../components/loadable-content";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import {
  useApplicationAsyncOptions,
  useEnvironmentAsyncOptions,
} from "../../../providers/async-options.provider";
import { parseNullableISO } from "../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../providers/pagination.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { CardDeployment } from "./components/card-deployment";

export const DeploymentsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    deployedAtFrom: string | null;
    deployedAtTo: string | null;
    applicationIds: string[];
    environmentIds: string[];
    archivedOnly: boolean;
  }>({
    initialValues: {
      deployedAtFrom: searchParams.get("deployedAtFrom"),
      deployedAtTo: searchParams.get("deployedAtTo"),
      applicationIds: searchParams.getAll("application"),
      environmentIds: searchParams.getAll("environment"),
      archivedOnly: searchParams.get("archivedOnly") === "true",
    },
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchedAfterMount,
  } = useDeploymentsInfiniteQuery(
    {
      input: {
        deployedAt: {
          from: filters.values.deployedAtFrom,
          to: filters.values.deployedAtTo,
        },
        applicationIds: filters.values.applicationIds,
        environmentIds: filters.values.environmentIds,
        archivedOnly: filters.values.archivedOnly,
      },
      workspaceId: workspace?.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const lastDeployment = lastPage.workspace.deployments.at(-1);

        return lastDeployment?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;

      fetchNextPage();
    },
  });

  const deployments = data?.pages
    .flatMap((page) => page.workspace.deployments)
    .filter((deployment): deployment is Deployment => !!deployment);

  const isLoading =
    (isFetching && !deployments) ||
    (isFetchedAfterMount &&
      isFetching &&
      (deployments?.length === 0 || !deployments));
  const isEmpty = !!(deployments && deployments.length === 0 && !isLoading);
  const isFiltering = Object.keys(searchParams.values).length > 0;

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(
    deployments,
    (deployment) => deployment.deployedAt,
  );

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Deployments" }]} />

      <Group gap={5}>
        <FilterDate
          label="Deployed"
          icon={IconCalendarFilled}
          onChange={(dates) => {
            const deployedAtFrom = dates[0]?.toISOString() || null;
            const deployedAtTo = dates[1]?.toISOString() || null;

            filters.setFieldValue("deployedAtFrom", deployedAtFrom);
            filters.setFieldValue("deployedAtTo", deployedAtTo);
            searchParams.set("deployedAtFrom", deployedAtFrom);
            searchParams.set("deployedAtTo", deployedAtTo);
          }}
          value={[
            parseNullableISO(filters.values.deployedAtFrom) || null,
            parseNullableISO(filters.values.deployedAtTo) || null,
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

        <FilterOptions>
          <FilterArchivedOnly
            checked={filters.values.archivedOnly}
            onChange={(value) => {
              filters.setFieldValue("archivedOnly", value);
              searchParams.set("archivedOnly", value ? "true" : null);
            }}
          />
        </FilterOptions>
      </Group>

      <LoadableContent
        mt="md"
        isLoading={isLoading}
        isEmpty={isEmpty}
        whenLoading={
          <Stack>
            <Skeleton height={40} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </Stack>
        }
        whenEmpty={
          <Box mt={80}>
            <PageEmptyState
              message="No deployments found."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.setValues({
                  deployedAtFrom: null,
                  deployedAtTo: null,
                  applicationIds: [],
                  environmentIds: [],
                  archivedOnly: false,
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
              {deployments?.map((deployment) => {
                const deployedAt = parseISO(deployment.deployedAt);

                return (
                  <Fragment key={deployment.id}>
                    {isFirstOfYearMonth(deployedAt, deployment.id) && (
                      <Divider
                        label={format(deployedAt, "MMMM yyyy")}
                        labelPosition="left"
                        style={{ gridColumn: "span 7" }}
                      />
                    )}
                    <CardDeployment deployment={deployment} />
                  </Fragment>
                );
              })}
            </Box>
            {hasNextPage && <LoaderInfiniteScroll ref={ref} />}
          </Stack>
        }
      />
      <Outlet />
    </PageContainer>
  );
};
