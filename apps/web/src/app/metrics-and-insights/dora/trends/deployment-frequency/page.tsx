import { Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router";
import { FilterSelect } from "../../../../../components/filter-select";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { ButtonUnderstand } from "../../components/button-understand";
import { DoraMetricOutletContext } from "../../types";
import { useDoraMetrics } from "../../useDoraMetrics";
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
              Count of <b>deployments to production</b> per period, based on the
              deployments Sweetr has ingested for the selected repositories.
              Each data point is the raw number of successful deploys in that
              period — not PRs or commits.
            </Text>
            <Title order={5}>Why it matters</Title>
            <Text size="sm">
              Deployment frequency is the cleanest proxy for <b>batch size</b>.
              Teams that deploy often are forced to ship in small, independently
              reviewable chunks, which means faster feedback, safer rollbacks,
              and less coordination overhead.
            </Text>
            <Title order={5}>DORA benchmarks</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                <b>Elite</b>: multiple deploys per day (on-demand)
              </li>
              <li>
                <b>High</b>: between once per day and once per week
              </li>
              <li>
                <b>Medium</b>: between once per week and once per month
              </li>
              <li>
                <b>Low</b>: less than once per month
              </li>
            </Text>
            <Title order={5}>What to look for</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                Sudden dips often point to <b>deploy friction</b>: flaky CI,
                manual approval steps, or incident freezes.
              </li>
              <li>
                Flat-low cadence usually means <b>big-bang releases</b> — push
                for trunk-based dev and feature flags.
              </li>
              <li>
                Pair with <b>Change Failure Rate</b>: rising frequency without
                rising failures is the goal.
              </li>
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.7" h={400} p="xs">
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
