import { Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router";
import { FilterSelect } from "../../../../../components/filter-select";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { ButtonUnderstand } from "../../components/button-understand";
import { DoraMetricOutletContext } from "../../types";
import { useDoraMetrics } from "../../useDoraMetrics";
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
              Percentage of <b>deployments</b> that caused an <b>incident</b>,
              per period. Computed as deployments linked to an incident ÷ total
              deployments in that period × 100. Only deployments with a linked
              incident count as failures — noisy alerts that never became
              incidents don't.
            </Text>
            <Title order={5}>Why it matters</Title>
            <Text size="sm">
              CFR is the quality counterweight to deployment frequency. Shipping
              more often is only a win if you're not breaking things more often.
              It surfaces gaps in testing, review depth, observability, and
              rollout safety.
            </Text>
            <Title order={5}>DORA benchmarks</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                <b>Elite / High</b>: 0–15%
              </li>
              <li>
                <b>Medium</b>: 16–30%
              </li>
              <li>
                <b>Low</b>: 31–45%+
              </li>
            </Text>
            <Title order={5}>What to look for</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                Always read alongside <b>Deployment Frequency</b>. A low CFR
                with near-zero deploys isn't healthy, it's stagnant.
              </li>
              <li>
                Persistently high CFR → invest in <b>test coverage</b>,{" "}
                <b>feature flags</b>, and <b>progressive rollouts</b> rather
                than slowing deploys down.
              </li>
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder bg="dark.7" h={400} p="xs">
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
