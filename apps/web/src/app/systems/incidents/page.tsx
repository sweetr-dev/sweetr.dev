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
import { useListGroupedByYearMonth } from "../../../providers/pagination.provider";
import { CardIncident } from "./components/card-incident";

export const IncidentsPage = () => {
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    deployedAtFrom: string | null;
    deployedAtTo: string | null;
  }>({
    initialValues: {
      deployedAtFrom: searchParams.get("deployedAtFrom"),
      deployedAtTo: searchParams.get("deployedAtTo"),
    },
  });

  const incidents = [
    {
      id: "1",
      causeDeployment: {
        application: {
          name: "www.sweetr.dev",
        },
        version: "1.0.0",
      },
      detectedAt: "2025-09-12 12:35:13",
      resolvedAt: "2025-09-13 11:38:53",
      fixDeployment: {
        application: {
          name: "www.currents.dev",
        },
        version: "1.0.0",
      },
      leader: {
        name: "John Doe",
        avatar: "https://github.com/john-doe.png",
      },
      team: {
        name: "Growth",
        icon: "🚀",
      },
    },
    {
      id: "2",
      causeDeployment: {
        application: {
          name: "www.sweetr.dev",
        },
        version: "1.0.0",
      },
      detectedAt: "2025-08-15 12:35:13",
      resolvedAt: "2025-08-17 11:38:53",
      fixDeployment: {
        application: {
          name: "www.sweetr.dev",
        },
        version: "1.0.0",
      },
      leader: {
        name: "John Doe",
        avatar: "https://github.com/john-doe.png",
      },
      team: {
        name: "Growth",
        icon: "🚀",
      },
    },
    {
      id: "3",
      causeDeployment: {
        application: {
          name: "api",
        },
        version: "1.0.0",
      },
      detectedAt: "2025-09-04 15:35:13",
      resolvedAt: "2025-09-04 19:38:53",
      fixDeployment: {
        application: {
          name: "api",
        },
        version: "1.0.0",
      },
      leader: {
        name: "John Doe",
        avatar: "https://github.com/john-doe2.png",
      },
      team: {
        name: "Core",
        icon: "⚡",
      },
    },
    {
      id: "4",
      causeDeployment: {
        application: {
          name: "www.sweetr.dev",
        },
        version: "1.0.0",
      },
      detectedAt: "2025-07-03 18:35:13",
      resolvedAt: "2025-07-03 19:01:53",
      fixDeployment: {
        application: {
          name: "www.currents.dev",
        },
        version: "1.0.0",
      },
      leader: {
        name: "John Doe",
        avatar: "https://github.com/john-doe.png",
      },
      team: {
        name: "Growth",
        icon: "🚀",
      },
    },
  ];

  const { isFirstOfYearMonth } = useListGroupedByYearMonth(
    incidents,
    (deployment) => deployment.detectedAt,
  );

  const isLoading = false;
  const isEmpty = false;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Incidents" }]} />

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
              message="No incidents found."
              isFiltering={searchParams.hasAny}
              onResetFilter={() => {
                filters.reset();
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
                gridTemplateColumns: "auto auto auto auto auto",
                justifyContent: "space-between",
                gap: "var(--stack-gap, var(--mantine-spacing-md))",
              }}
            >
              {incidents?.map((incident) => {
                const deployedAt = parseISO(incident.detectedAt);

                return (
                  <Fragment key={incident.id}>
                    {isFirstOfYearMonth(deployedAt, incident.id) && (
                      <Divider
                        label={format(deployedAt, "MMMM yyyy")}
                        labelPosition="left"
                        style={{
                          gridColumn: "span 5",
                        }}
                      />
                    )}
                    <CardIncident incident={incident} />
                  </Fragment>
                );
              })}
            </Box>
          </Stack>
        }
      />
    </PageContainer>
  );
};
