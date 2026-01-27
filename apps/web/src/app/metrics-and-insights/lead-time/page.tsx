import { Box, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router-dom";
import { FilterSelect } from "../../../components/filter-select";
import { useWorkspace } from "../../../providers/workspace.provider";
import { ButtonUnderstand } from "../components/button-understand";
import { DoraMetricOutletContext } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartAverageTime } from "../../humans/teams/[id]/health-and-performance/components/chart-average-time";
import { LeadTimeBreakdown } from "./components/lead-time-breakdown";

export const DoraLeadTimePage = () => {
  const { workspace } = useWorkspace();
  const { filters, onPeriodChange } =
    useOutletContext<DoraMetricOutletContext>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.leadTime) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <Group justify="space-between" mb="md">
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
          value={filters.period}
          onChange={(value) => onPeriodChange(value as Period)}
        />
        <ButtonUnderstand>
          <Stack gap="xs">
            <Text size="sm">
              Lead Time measures how long it takes for code to go from first
              commit to production. Shorter lead times mean your team can
              deliver value faster and respond quickly to customer needs.
            </Text>
            <Text size="sm">
              Use the breakdown below to identify bottlenecks: Is code waiting
              too long for review? Are approvals slow? This helps you focus
              improvement efforts where they matter most.
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.6" h={400} p="xs">
        <ChartAverageTime
          chartData={{
            columns: metrics.leadTime.columns,
            data: metrics.leadTime.data,
          }}
          period={filters.period}
        />
      </Paper>

      {metrics.leadTime.breakdown && (
        <Box mt="xl">
          <LeadTimeBreakdown
            breakdown={metrics.leadTime.breakdown}
            previousPeriod={metrics.leadTime.previousPeriod}
          />
        </Box>
      )}
    </>
  );
};
