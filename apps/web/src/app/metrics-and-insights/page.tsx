import { Breadcrumbs } from "../../components/breadcrumbs";
import { PageContainer } from "../../components/page-container";
import { Box, Group, Divider } from "@mantine/core";
import {
  IconBox,
  IconCalendarFilled,
  IconClock,
  IconFireExtinguisher,
  IconFlame,
  IconServer,
} from "@tabler/icons-react";
import { FilterMultiSelect } from "../../components/filter-multi-select";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../providers/filter.provider";
import { IconDeployment, IconTeam } from "../../providers/icon.provider";
import {
  useApplicationAsyncOptions,
  useEnvironmentAsyncOptions,
  useTeamAsyncOptions,
} from "../../providers/async-options.provider";
import { parseNullableISO } from "../../providers/date.provider";
import { FilterDate } from "../../components/filter-date";
import { CardDoraMetric } from "./components/card-dora-metric/dora-card-stat";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const MetricsAndInsightsPage = () => {
  const { pathname } = useLocation();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    from: string | null;
    to: string | null;
    teamIds: string[];
    applicationIds: string[];
    environmentIds: string[];
  }>({
    initialValues: {
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      teamIds: searchParams.getAll<string[]>("team") || [],
      applicationIds: searchParams.getAll<string[]>("application") || [],
      environmentIds: searchParams.getAll<string[]>("environment") || [],
    },
  });

  if (pathname === "/metrics-and-insights") {
    return <Navigate to="/metrics-and-insights/frequency" />;
  }

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />

      <Box mt="md">
        <Group gap={5}>
          <FilterDate
            label="Date range"
            icon={IconCalendarFilled}
            onChange={(dates) => {
              const from = dates[0]?.toISOString() || null;
              const to = dates[1]?.toISOString() || null;

              filters.setFieldValue("from", from);
              filters.setFieldValue("to", to);
              searchParams.set("from", from);
              searchParams.set("to", to);
            }}
            value={[
              parseNullableISO(filters.values.from) || null,
              parseNullableISO(filters.values.to) || null,
            ]}
          />
          <FilterMultiSelect
            label="Owner"
            icon={IconTeam}
            asyncController={useTeamAsyncOptions}
            withSearch
            value={filters.values.teamIds}
            onChange={(value) => {
              filters.setFieldValue("teamIds", value);
              searchParams.set("team", value);
            }}
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

        <Divider my="md" label="DORA Metrics" labelPosition="left" />

        <Group>
          <CardDoraMetric
            name="Frequency"
            amount="5"
            change={10}
            icon={IconDeployment}
            href="/metrics-and-insights/frequency"
          />
          <CardDoraMetric
            name="Lead time"
            amount="10h 51m"
            change={-90}
            icon={IconClock}
            href="/metrics-and-insights/lead-time"
          />
          <CardDoraMetric
            name="Failure rate"
            amount="9.1%"
            change={-9}
            icon={IconFlame}
            href="/metrics-and-insights/failure-rate"
          />
          <CardDoraMetric
            name="MTTR"
            amount="9m"
            change={-41}
            icon={IconFireExtinguisher}
            href="/metrics-and-insights/mttr"
          />
        </Group>

        <Box mt="md">
          <Outlet />
        </Box>
      </Box>
    </PageContainer>
  );
};
