import {
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconRefresh } from "@tabler/icons-react";
import { useOutletContext } from "react-router";
import { FilterSelect } from "../../../../../components/filter-select";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { ButtonUnderstand } from "../../components/button-understand";
import { DoraMetricOutletContext } from "../../types";
import { useDoraMetrics } from "../../useDoraMetrics";
import { ChartAverageTime } from "../../../components/chart-average-time";
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
              Average time from <b>first commit</b> of a PR to the moment
              it's <b>deployed to production</b>. For each deployment, we
              take the earliest commit across all PRs it included and
              measure until <code>deployedAt</code>; this chart plots the
              average per period.
            </Text>
            <Title order={5}>Why it matters</Title>
            <Text size="sm">
              Lead time is the end-to-end "code written → code serving
              users" clock. It captures every source of delay: slow
              reviews, approval drought, flaky CI, batched releases. The
              breakdown below splits this total into its phases so you can
              attack the biggest slice first.
            </Text>
            <Title order={5}>DORA benchmarks</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                <b>Elite</b>: less than one day
              </li>
              <li>
                <b>High</b>: between one day and one week
              </li>
              <li>
                <b>Medium</b>: between one week and one month
              </li>
              <li>
                <b>Low</b>: more than one month
              </li>
            </Text>
            <Title order={5}>What to look for</Title>
            <Text size="sm" component="ul" pl="md" m={0}>
              <li>
                A single stage (review, approval, merge) dominating the
                breakdown = clear target for investment.
              </li>
              <li>
                Lead time creeping up while <b>PR size</b> stays flat =
                review capacity problem, not an authoring problem.
              </li>
              <li>
                Large gap between merge and deploy = release cadence,
                staging bottleneck, or manual promotion steps.
              </li>
            </Text>
          </Stack>
        </ButtonUnderstand>
      </Group>

      <Paper withBorder h={400} p="xs">
        <ChartAverageTime
          seriesName="Lead Time"
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
