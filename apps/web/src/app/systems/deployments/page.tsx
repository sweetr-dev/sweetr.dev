import { Box, Divider, Group, Skeleton, Stack } from "@mantine/core";
import { IconBox, IconCalendarFilled, IconServer } from "@tabler/icons-react";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterDate } from "../../../components/filter-date";
import { PageContainer } from "../../../components/page-container";
import { parseNullableISO } from "../../../providers/date.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { useForm } from "@mantine/form";
import { parseISO, format } from "date-fns";
import { Fragment } from "react/jsx-runtime";
import { LoadableContent } from "../../../components/loadable-content";
import { PageEmptyState } from "../../../components/page-empty-state";
import {
  useInfiniteLoading,
  useListGroupedByYearMonth,
} from "../../../providers/pagination.provider";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { CardDeployment } from "./components/card-deployment";
import {
  useApplicationAsyncOptions,
  useEnvironmentAsyncOptions,
} from "../../../providers/async-options.provider";
import { useDeploymentsInfiniteQuery } from "../../../api/deployments.api";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";
import { Outlet } from "react-router-dom";

export const DeploymentsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    deployedAtFrom: string | null;
    deployedAtTo: string | null;
    applicationIds: string[];
    environmentIds: string[];
  }>({
    initialValues: {
      deployedAtFrom: searchParams.get("deployedAtFrom"),
      deployedAtTo: searchParams.get("deployedAtTo"),
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
  } = useDeploymentsInfiniteQuery(
    {
      input: {
        deployedAt: {
          from: filters.values.deployedAtFrom,
          to: filters.values.deployedAtTo,
        },
        applicationIds: filters.values.applicationIds,
        environmentIds: filters.values.environmentIds,
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
              message="No deployments found."
              isFiltering={isFiltering}
              onResetFilter={() => {
                filters.setValues({
                  deployedAtFrom: null,
                  deployedAtTo: null,
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
              {deployments?.map((deployment) => {
                const deployedAt = parseISO(deployment.deployedAt);

                return (
                  <Fragment key={deployment.id}>
                    {isFirstOfYearMonth(deployedAt, deployment.id) && (
                      <Divider
                        label={format(deployedAt, "MMMM yyyy")}
                        labelPosition="left"
                        style={{
                          gridColumn: "span 6",
                        }}
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
