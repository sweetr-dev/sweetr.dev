import { Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router-dom";
import { FilterSelect } from "../../../components/filter-select";
import { useWorkspace } from "../../../providers/workspace.provider";
import { ButtonUnderstand } from "../components/button-understand";
import { DoraMetricOutletContext } from "../types";
import { useDoraMetrics } from "../useDoraMetrics";
import { ChartDeploymentFrequency } from "./chart-deployment-frequency/chart-deployment-frequency";

export const DoraDeploymentFrequencyPage = () => {
  const { filters, onPeriodChange } =
    useOutletContext<DoraMetricOutletContext>();
  const { workspace } = useWorkspace();

  const { isLoading, metrics } = useDoraMetrics({
    workspaceId: workspace.id,
    filters,
  });

  if (isLoading || !metrics.deploymentFrequency) {
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
              Deployment Frequency shows how often your team ships code to
              production. Higher frequency typically indicates smaller, safer
              changes and a healthy CI/CD pipeline.
            </Text>
            <Text size="sm">
              Elite teams deploy multiple times per day. If your frequency is
              low, look for large batch sizes, manual processes, or fear of
              deploying that might be slowing you down.
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.6" h={400} p="xs">
        <ChartDeploymentFrequency
          chartData={{
            columns: metrics.deploymentFrequency.columns,
            series: [
              {
                name: "Deployments",
                data: metrics.deploymentFrequency.data,
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
