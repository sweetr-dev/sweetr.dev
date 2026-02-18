import { Box, Divider, Group, Skeleton } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconBox,
  IconCalendarFilled,
  IconClock,
  IconFireExtinguisher,
  IconFlame,
  IconServer,
} from "@tabler/icons-react";
import { endOfToday } from "date-fns";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { FilterDate } from "../../components/filter-date";
import { FilterMultiSelect } from "../../components/filter-multi-select";
import { PageContainer } from "../../components/page-container";
import {
  useApplicationAsyncOptions,
  useEnvironmentAsyncOptions,
  useTeamAsyncOptions,
} from "../../providers/async-options.provider";
import {
  getAbbreviatedDuration,
  humanizeDuration,
  parseNullableISO,
  thirtyDaysAgo,
} from "../../providers/date.provider";
import { useFilterSearchParameters } from "../../providers/filter.provider";
import { IconDeployment, IconTeam } from "../../providers/icon.provider";
import { useScreenSize } from "../../providers/screen.provider";
import { useWorkspace } from "../../providers/workspace.provider";
import { CardDoraMetric } from "./components/card-dora-metric/dora-card-stat";
import { DoraMetricFilters, DoraMetricOutletContext } from "./types";
import { useDoraMetrics } from "./useDoraMetrics";

export const MetricsAndInsightsPage = () => {
  const { pathname } = useLocation();
  const searchParams = useFilterSearchParameters();
  const { workspace } = useWorkspace();
  const { isSmallScreen } = useScreenSize();

  const filters = useForm<DoraMetricFilters>({
    initialValues: {
      from: searchParams.get("from") || thirtyDaysAgo().toISOString(),
      to: searchParams.get("to") || endOfToday().toISOString(),
      teamIds: searchParams.getAll<string[]>("team") || [],
      applicationIds: searchParams.getAll<string[]>("application") || [],
      environmentIds: searchParams.getAll<string[]>("environment") || [],
      period: (searchParams.get("period") as Period) || Period.WEEKLY,
    },
  });

  const { metrics, isLoading } = useDoraMetrics({
    workspaceId: workspace.id,
    filters: filters.values,
  });

  if (pathname === "/metrics-and-insights") {
    return <Navigate to="/metrics-and-insights/deployment-frequency" />;
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
            label="Team"
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

        <Divider mt="xl" mb="md" label="DORA Overview" labelPosition="left" />

        {!isLoading && (
          <Group wrap={isSmallScreen ? "wrap" : "nowrap"}>
            <CardDoraMetric
              name="Deployments"
              amount={
                metrics.deploymentFrequency?.currentAmount?.toString() || "0"
              }
              previousAmount={
                (metrics.deploymentFrequency?.previousAmount || 0) +
                " deployments"
              }
              amountDescription={`${metrics.deploymentFrequency?.avg} per day`}
              change={metrics.deploymentFrequency?.change || 0}
              icon={IconDeployment}
              href="/metrics-and-insights/deployment-frequency"
              higherIsBetter={true}
              previousPeriod={metrics.deploymentFrequency?.previousPeriod}
            />
            <CardDoraMetric
              name="Lead Time"
              amount={
                metrics.leadTime?.currentAmount
                  ? humanizeDuration(metrics.leadTime?.currentAmount)
                  : "0 hours"
              }
              previousAmount={
                metrics.leadTime?.previousAmount
                  ? humanizeDuration(metrics.leadTime?.previousAmount)
                  : "0 hours"
              }
              change={metrics.leadTime?.change || 0}
              icon={IconClock}
              href="/metrics-and-insights/lead-time"
              higherIsBetter={false}
              previousPeriod={metrics.leadTime?.previousPeriod}
            />
            <CardDoraMetric
              name="Failure Rate"
              amount={`${metrics.changeFailureRate?.currentAmount?.toString() || "0"}%`}
              previousAmount={`${metrics.changeFailureRate?.previousAmount?.toString() || "0"}%`}
              change={metrics.changeFailureRate?.change || 0}
              icon={IconFlame}
              href="/metrics-and-insights/failure-rate"
              higherIsBetter={false}
              previousPeriod={metrics.changeFailureRate?.previousPeriod}
            />
            <CardDoraMetric
              name="MTTR"
              amount={
                metrics.meanTimeToRecover?.currentAmount
                  ? getAbbreviatedDuration(
                      metrics.meanTimeToRecover?.currentAmount,
                    )
                  : "0 hours"
              }
              previousAmount={
                metrics.meanTimeToRecover?.previousAmount
                  ? getAbbreviatedDuration(
                      metrics.meanTimeToRecover?.previousAmount,
                    )
                  : "0 hours"
              }
              change={metrics.meanTimeToRecover?.change || 0}
              icon={IconFireExtinguisher}
              href="/metrics-and-insights/mttr"
              higherIsBetter={false}
              previousPeriod={metrics.meanTimeToRecover?.previousPeriod}
            />
          </Group>
        )}

        {isLoading && (
          <Group wrap={isSmallScreen ? "wrap" : "nowrap"}>
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
          </Group>
        )}

        <Divider mt="xl" mb="md" label="Trends" labelPosition="left" />

        <Box mt="md">
          <Outlet
            context={
              {
                filters: filters.values,
                onPeriodChange: (period: Period) => {
                  filters.setFieldValue("period", period);
                  searchParams.set("period", period);
                },
              } satisfies DoraMetricOutletContext
            }
          />
        </Box>
      </Box>
    </PageContainer>
  );
};
