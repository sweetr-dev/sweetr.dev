import { Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router";
import { FilterSelect } from "../../../../../components/filter-select";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { ButtonUnderstand } from "../../components/button-understand";
import { DoraMetricOutletContext } from "../../types";
import { useDoraMetrics } from "../../useDoraMetrics";
import { ChartAverageTime } from "../../../components/chart-average-time";

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
              Average time from <b>incident detected</b> to{" "}
              <b>incident resolved</b>, bucketed by the period the incident
              was detected in. Only resolved incidents contribute to the
              average; ongoing ones are excluded until they close.
            </Text>
            <Title order={5}>Why it matters</Title>
            <Text size="sm">
              Incidents are unavoidable — recovery speed isn't. MTTR is a
              direct signal of your <b>operational maturity</b>:
              observability, on-call readiness, rollback tooling, and
              runbooks. Short MTTR means users barely notice; long MTTR
              means every bug becomes a business problem.
            </Text>
            <Title order={5}>DORA benchmarks</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                <b>Elite</b>: less than one hour
              </li>
              <li>
                <b>High</b>: less than one day
              </li>
              <li>
                <b>Medium</b>: between one day and one week
              </li>
              <li>
                <b>Low</b>: more than one week
              </li>
            </Text>
            <Title order={5}>What to look for</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                Spikes usually mean <b>detection was slow</b>, not fix time
                — audit alerting thresholds and on-call paging.
              </li>
              <li>
                Consistently long MTTR → invest in <b>instant rollback</b>,{" "}
                <b>feature flags</b>, and <b>runbooks</b> before chasing
                root causes.
              </li>
              <li>
                Compare against <b>Change Failure Rate</b>: low CFR + low
                MTTR is the win condition.
              </li>
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder h={400} p="xs">
        <ChartAverageTime
          seriesName="MTTR"
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
