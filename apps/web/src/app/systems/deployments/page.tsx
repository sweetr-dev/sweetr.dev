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
import { useListGroupedByYearMonth } from "../../../providers/pagination.provider";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { CardDeployment } from "./components/card-deployment";

export const DeploymentsPage = () => {
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    createdAtFrom: string | null;
    createdAtTo: string | null;
  }>({
    initialValues: {
      createdAtFrom: searchParams.get("createdAtFrom"),
      createdAtTo: searchParams.get("createdAtTo"),
    },
  });

  const deployments = [
    {
      id: "1",
      application: {
        name: "is-services",
      },
      version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
      environment: {
        name: "production",
        isProduction: true,
      },
      deployedAt: "2025-09-12 12:35:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "2",
      application: {
        name: "www.currents.dev",
      },
      version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
      environment: {
        name: "production",
        isProduction: true,
      },
      deployedAt: "2025-09-12 12:32:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "3",
      application: {
        name: "api",
      },
      version: "v41.21.36",
      environment: {
        name: "staging",
        isProduction: false,
      },
      deployedAt: "2025-09-12 12:31:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "4",
      application: {
        name: "www.currents.dev",
      },
      version: "v1.0.0",
      environment: {
        name: "production",
        isProduction: true,
      },
      deployedAt: "2025-09-12 12:32:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "5",
      application: {
        name: "www.currents.dev",
      },
      deployedAt: "2025-07-12 12:32:13",
      version: "v1.0.0",
      environment: {
        name: "production",
        isProduction: true,
      },
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "6",
      application: {
        name: "www.currents.dev",
      },
      version: "v1.0.0",
      environment: {
        name: "production",
        isProduction: true,
      },
      deployedAt: "2025-07-12 12:32:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
    {
      id: "7",
      application: {
        name: "www.currents.dev",
      },
      version: "v1.0.0",
      environment: {
        name: "production",
        isProduction: true,
      },
      deployedAt: "2025-07-12 12:32:13",
      pullRequests: [
        {
          id: "1",
          title: "Fix bug",
        },
      ],
    },
  ];

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(
    deployments,
    (deployment) => deployment.deployedAt,
  );

  const isLoading = false;
  const isEmpty = false;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Deployments" }]} />

      <Group gap={5}>
        <FilterDate
          label="Deployed"
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
        <FilterMultiSelect
          label="Application"
          icon={IconBox}
          items={["production", "staging"]}
          value={[]}
        />
        <FilterMultiSelect
          label="Environment"
          icon={IconServer}
          items={["production", "staging"]}
          value={[]}
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
              isFiltering={searchParams.hasAny}
              onResetFilter={() => {
                filters.reset();
                searchParams.reset();
              }}
            />
          </Box>
        }
        content={
          <Box
            display="grid"
            style={{
              gridTemplateColumns: "auto auto auto auto auto",
              justifyContent: "space-between",
              gap: "var(--stack-gap, var(--mantine-spacing-md))",
            }}
            mt="md"
          >
            {deployments?.map((deployment) => {
              const createdAt = parseISO(deployment.deployedAt);

              return (
                <Fragment key={deployment.id}>
                  {isFirstOfYearMonth(createdAt, deployment.id) && (
                    <Divider
                      label={format(createdAt, "MMMM yyyy")}
                      labelPosition="left"
                      style={{
                        gridColumn: "span 5",
                      }}
                    />
                  )}
                  <CardDeployment deployment={deployment} />
                </Fragment>
              );
            })}
          </Box>
        }
      />
    </PageContainer>
  );
};
