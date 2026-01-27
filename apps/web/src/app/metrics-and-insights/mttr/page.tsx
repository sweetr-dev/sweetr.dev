import { Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router-dom";
import { FilterSelect } from "../../../components/filter-select";
import { useWorkspace } from "../../../providers/workspace.provider";
import { ButtonUnderstand } from "../components/button-understand";
import { DoraMetricOutletContext } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartAverageTime } from "../../humans/teams/[id]/health-and-performance/components/chart-average-time";

export const DoraMttrPage = () => {
  const { workspace } = useWorkspace();
  const { filters, onPeriodChange } =
    useOutletContext<DoraMetricOutletContext>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.meanTimeToRecover) {
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
              Mean Time to Recovery (MTTR) measures how quickly your team
              restores service after a failure. Shorter recovery times mean less
              impact on users and business.
            </Text>
            <Text size="sm">
              Elite teams recover in under an hour. To improve MTTR, invest in
              monitoring and alerting, practice incident response, and ensure
              quick rollback capabilities are in place.
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.6" h={400} p="xs">
        <ChartAverageTime
          chartData={{
            columns: metrics.meanTimeToRecover.columns,
            data: metrics.meanTimeToRecover.data,
          }}
          period={filters.period}
        />
      </Paper>
    </>
  );
};
