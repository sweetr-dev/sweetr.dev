import { Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router-dom";
import { FilterSelect } from "../../../components/filter-select";
import { useWorkspace } from "../../../providers/workspace.provider";
import { ButtonUnderstand } from "../components/button-understand";
import { DoraMetricOutletContext } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartFailureRate } from "./chart-failure-rate/chart-failure-rate";

export const DoraFailureRatePage = () => {
  const { workspace } = useWorkspace();
  const { filters, onPeriodChange } =
    useOutletContext<DoraMetricOutletContext>();
  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.changeFailureRate) {
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
              Change Failure Rate measures the percentage of deployments that
              cause a failure in production. Lower rates indicate better
              testing, code review practices, and overall code quality.
            </Text>
            <Text size="sm">
              Elite teams maintain a failure rate below 15%. If yours is higher,
              consider improving test coverage, adding staging environments, or
              implementing feature flags for safer rollouts.
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.6" h={400} p="xs">
        <ChartFailureRate
          chartData={{
            columns: metrics.changeFailureRate.columns,
            series: [
              {
                name: "Failure Rate",
                data: metrics.changeFailureRate.data,
                color: "#8ce99a",
              },
            ],
          }}
          period={filters.period}
        />
      </Paper>
    </>
  );
};
