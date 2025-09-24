import { Breadcrumbs } from "../../components/breadcrumbs";
import { PageContainer } from "../../components/page-container";
import { Tabs, Paper, Box, Group, Divider } from "@mantine/core";
import {
  IconBox,
  IconCalendarFilled,
  IconClock,
  IconFireExtinguisher,
  IconFlame,
  IconRefresh,
  IconServer,
} from "@tabler/icons-react";
import { DoraMetricsCards } from "./components/dora-metrics-cards/dora-metrics-cards";
import { DoraMetricsChart } from "./components/dora-metrics-chart/dora-metrics-chart";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { useState } from "react";
import { FilterDate } from "../../components/filter-date";
import { FilterMultiSelect } from "../../components/filter-multi-select";
import { parseNullableISO } from "../../providers/date.provider";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../providers/filter.provider";
import { FilterSelect } from "../../components/filter-select";
import { IconDeployment, IconTeam } from "../../providers/icon.provider";

const mockDoraData = {
  frequency: {
    current: "90 deployments",
    previous: "0.71 /day - 10 total",
    change: 11,
  },
  leadTime: {
    current: "10h 51m",
    change: -90,
  },
  failureRate: {
    current: "9.1%",
    change: -9,
  },
  mttr: {
    current: "9m",
    change: -41,
  },
};

const mockChartData = {
  columns: [
    "2025-07-01T00:00:00Z",
    "2025-07-08T00:00:00Z",
    "2025-07-15T00:00:00Z",
    "2025-07-22T00:00:00Z",
    "2025-07-29T00:00:00Z",
    "2025-08-05T00:00:00Z",
    "2025-08-12T00:00:00Z",
    "2025-08-19T00:00:00Z",
    "2025-08-26T00:00:00Z",
    "2025-09-02T00:00:00Z",
    "2025-09-09T00:00:00Z",
    "2025-09-16T00:00:00Z",
    "2025-09-23T00:00:00Z",
    "2025-09-30T00:00:00Z",
  ],
  frequency: {
    name: "Deployment Frequency",
    data: [21, 30, 65, 35, 45, 26, 44, 55, 61, 48, 77, 50, 49, 90],
    color: "#8ce99a",
  },
  leadTime: {
    name: "Lead Time",
    data: [
      2.5, 2.2, 2.8, 2.1, 2.3, 2.0, 1.9, 2.2, 2.1, 2.3, 2.0, 2.1, 2.2, 2.0,
    ],
    color: "#8ce99a",
  },
  failureRate: {
    name: "Failure Rate",
    data: [
      0.15, 0.12, 0.18, 0.1, 0.13, 0.09, 0.08, 0.11, 0.1, 0.12, 0.09, 0.1, 0.11,
      0.09,
    ],
    color: "#8ce99a",
  },
  mttr: {
    name: "MTTR",
    data: [
      0.3, 0.25, 0.35, 0.2, 0.28, 0.18, 0.15, 0.22, 0.2, 0.25, 0.18, 0.2, 0.22,
      0.18,
    ],
    color: "#8ce99a",
  },
};

export const MetricsAndInsightsPage = () => {
  const [activeTab, setActiveTab] = useState<string | null>("frequency");
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    from: string | null;
    to: string | null;
  }>({
    initialValues: {
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    },
  });

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />

      <Box mt="md">
        <Group gap={5}>
          <FilterMultiSelect
            label="Team"
            icon={IconTeam}
            items={["production", "staging"]}
            value={[]}
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

        <Divider mt="md" label="Last 30 days" labelPosition="left" />
        <DoraMetricsCards data={mockDoraData} mt="md" />

        <Tabs
          mt="md"
          value={activeTab}
          onChange={setActiveTab}
          color="green.4"
          variant="default"
        >
          <Tabs.List>
            <Tabs.Tab
              value="frequency"
              leftSection={<IconDeployment size={24} stroke={1.5} />}
            >
              Frequency
            </Tabs.Tab>
            <Tabs.Tab
              value="lead-time"
              leftSection={<IconClock size={24} stroke={1.5} />}
            >
              Lead Time
            </Tabs.Tab>
            <Tabs.Tab
              value="failure-rate"
              leftSection={<IconFlame size={24} stroke={1.5} />}
            >
              Failure Rate
            </Tabs.Tab>
            <Tabs.Tab
              value="mttr"
              leftSection={<IconFireExtinguisher size={24} stroke={1.5} />}
            >
              MTTR
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="frequency" pt="md">
            <Group gap={5} mb="md">
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

              <FilterSelect
                label="Period"
                icon={IconRefresh}
                items={[
                  Period.DAILY,
                  Period.WEEKLY,
                  Period.MONTHLY,
                  Period.QUARTERLY,
                  Period.YEARLY,
                ]}
                value={Period.MONTHLY}
                onChange={(value) => {
                  filters.setFieldValue("period", value as Period);
                  searchParams.set("period", value);
                }}
              />
            </Group>

            <Paper withBorder h={400} p="xs" bg="dark.6">
              <DoraMetricsChart
                chartData={{
                  columns: mockChartData.columns,
                  series: [mockChartData.frequency],
                }}
                period={Period.WEEKLY}
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="lead-time" pt="md">
            <Paper withBorder h={400} p="xs" bg="dark.6">
              <DoraMetricsChart
                chartData={{
                  columns: mockChartData.columns,
                  series: [mockChartData.leadTime],
                }}
                period={Period.WEEKLY}
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="failure-rate" pt="md">
            <Paper withBorder h={400} p="xs" bg="dark.6">
              <DoraMetricsChart
                chartData={{
                  columns: mockChartData.columns,
                  series: [mockChartData.failureRate],
                }}
                period={Period.WEEKLY}
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="mttr" pt="md">
            <Paper withBorder h={400} p="xs" bg="dark.6">
              <DoraMetricsChart
                chartData={{
                  columns: mockChartData.columns,
                  series: [mockChartData.frequency],
                }}
                period={Period.WEEKLY}
              />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </PageContainer>
  );
};
