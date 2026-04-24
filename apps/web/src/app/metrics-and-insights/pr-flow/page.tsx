import {
  Divider,
  Grid,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { LoadableContent } from "../../../components/loadable-content";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconCalendarFilled, IconRefresh } from "@tabler/icons-react";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterDate } from "../../../components/filter-date";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { FilterSelect } from "../../../components/filter-select";
import { PageContainer } from "../../../components/page-container";
import {
  useRepositoryAsyncOptions,
  useTeamAsyncOptions,
} from "../../../providers/async-options.provider";
import { parseNullableISO } from "../../../providers/date.provider";
import { IconRepository, IconTeam } from "../../../providers/icon.provider";
import { CardChart } from "../../../components/card-chart";
import { ChartCycleTimeBreakdown } from "./components/chart-cycle-time-breakdown";
import { ChartSizeDistribution } from "./components/chart-size-distribution";
import { ChartSizeCycleCorrelation } from "./components/chart-size-cycle-correlation";
import { ChartThroughput } from "./components/chart-throughput";
import { TableTeamOverview } from "./components/table-team-overview";
import { usePrFlowPage } from "./usePrFlowPage";
import { useLargerPageContainer } from "../../../providers/page.provider";

export const PrFlowPage = () => {
  const {
    searchParams,
    filters,
    isLoading,
    prFlow,
    handleColumnClick,
    handleThroughputClick,
  } = usePrFlowPage();

  useLargerPageContainer("lg");

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />

      <Group gap={5}>
        <FilterDate
          label="Date range"
          icon={IconCalendarFilled}
          onChange={(dates) => {
            const from = dates[0]?.toISOString() || null;
            const to = dates[1]?.toISOString() || null;
            filters.setFieldValue("from", from);
            filters.setFieldValue("to", to);
            searchParams.setMany({ from, to });
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
          label="Repository"
          icon={IconRepository}
          asyncController={useRepositoryAsyncOptions}
          withSearch
          value={filters.values.repositoryIds}
          capitalize={false}
          onChange={(value) => {
            filters.setFieldValue("repositoryIds", value);
            searchParams.set("repository", value);
          }}
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
          value={filters.values.period}
          onChange={(value) => {
            if (!value) return;
            filters.setFieldValue("period", value as Period);
            searchParams.set("period", value);
          }}
        />
      </Group>

      <Divider mt="xl" mb="md" label="Pull Request" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Skeleton h={340} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Skeleton h={340} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Skeleton h={500} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Skeleton h={500} />
            </Grid.Col>
          </Grid>
        }
        content={
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <CardChart
                title="PR Throughput"
                description={
                  <Stack gap="xs">
                    <Text size="sm">
                      Per-period counts of PR activity, with two bars side by
                      side:
                    </Text>
                    <Text size="sm" component="ul" pl="md" m={0}>
                      <li>
                        <b>Opened</b> — PRs created in that period (measures
                        work started).
                      </li>
                      <li>
                        <b>Merged / Closed</b> — stacked bar of PRs that exited
                        the queue (measures work shipped vs dropped).
                      </li>
                    </Text>
                    <Title order={5}>Why it matters</Title>
                    <Text size="sm">
                      Throughput is the raw delivery rate. Compared against
                      opens, it surfaces whether the team is keeping up with
                      incoming work or building up WIP. A rising close rate (vs
                      merge) can hint at abandoned branches or scope churn.
                    </Text>
                    <Text size="sm">
                      Click a column to jump to the PRs opened, merged, or
                      closed in that period.
                    </Text>
                  </Stack>
                }
              >
                <ChartThroughput
                  chartId="pr-flow-throughput"
                  chartData={prFlow?.throughput}
                  period={filters.values.period}
                  onColumnClick={handleThroughputClick}
                />
              </CardChart>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <CardChart
                title="PR Size distribution"
                description={
                  <Stack gap="xs">
                    <Text size="sm">
                      Per-period stacked bar of <b>merged PRs</b> bucketed by
                      size (lines added + deleted):
                    </Text>
                    <Text size="sm" component="ul" pl="md" m={0}>
                      <li>
                        Buckets <b>XS → XL</b>, using the size thresholds
                        configured in your workspace settings.
                      </li>
                      <li>
                        The overlaid <b>white line</b> tracks average lines
                        changed per PR (right axis).
                      </li>
                    </Text>
                    <Title order={5}>Why it matters</Title>
                    <Text size="sm">
                      Small PRs are easier to review, safer to ship, and faster
                      to merge. If your distribution skews to L/XL, reviews get
                      superficial and cycle time balloons. This chart makes the
                      team's "default PR size" visible so you can push culture
                      toward smaller batches.
                    </Text>
                    <Text size="sm">
                      Click a column to inspect the PRs merged in that period.
                    </Text>
                  </Stack>
                }
              >
                <ChartSizeDistribution
                  chartId="pr-flow-size-distribution"
                  chartData={prFlow?.pullRequestSizeDistribution}
                  period={filters.values.period}
                  onColumnClick={handleColumnClick}
                />
              </CardChart>
            </Grid.Col>
            <Grid.Col span={12}>
              <CardChart
                title="PR Cycle time Breakdown"
                description={
                  <Stack gap="xs">
                    <Text size="sm">
                      Splits mean <b>cycle time</b> for <b>merged PRs</b> into
                      its four sequential phases, stacked per period:
                    </Text>
                    <Text size="sm" component="ul" pl="md" m={0}>
                      <li>
                        <b>Coding</b> — first commit to PR marked ready for
                        review.
                      </li>
                      <li>
                        <b>First Review</b> — ready for review to first review
                        submitted.
                      </li>
                      <li>
                        <b>Approval</b> — first review to the approval that
                        unblocks merge.
                      </li>
                      <li>
                        <b>Merge</b> — approval to merge (usually CI + merge
                        queue).
                      </li>
                    </Text>
                    <Text size="sm">
                      The <b>white line</b> is total cycle time (sum of the four
                      phases).
                    </Text>
                    <Title order={5}>Why it matters</Title>
                    <Text size="sm">
                      Cycle time is the end-to-end "idea to shipped" clock, but
                      the average alone hides where time actually goes. This
                      breakdown tells you <i>which phase</i> to attack first:
                      slow reviews, stale approvals, flaky CI, or authors
                      sitting on branches.
                    </Text>
                    <Text size="sm">
                      Click a column to drill into the PRs merged in that
                      period.
                    </Text>
                  </Stack>
                }
                height={500}
              >
                <ChartCycleTimeBreakdown
                  chartId="pr-flow-cycle-time"
                  chartData={prFlow?.cycleTimeBreakdown}
                  period={filters.values.period}
                  onColumnClick={handleColumnClick}
                />
              </CardChart>
            </Grid.Col>
            <Grid.Col span={12}>
              <CardChart
                title="PR Size vs Cycle Time"
                description={
                  <Stack gap="xs">
                    <Text size="sm">
                      Scatter of <b>merged PRs</b> in the selected period,
                      plotting <b>cycle time</b> (x, log scale) against{" "}
                      <b>lines changed</b> (y, log scale). Each dot is one PR,
                      colored by size bucket (XS → XL).
                    </Text>
                    <Title order={5}>Why it matters</Title>
                    <Text size="sm">
                      PR size is the single biggest predictor of cycle time.
                      This chart makes that relationship concrete for your team
                      and surfaces outliers that don't follow it.
                    </Text>
                    <Title order={5}>What to look for</Title>
                    <Text size="sm" component="ul" pl="md" m={0}>
                      <li>
                        <b>Far-right outliers</b> (any size, multi-day cycle) —
                        PRs that got stuck. Check whether in review, waiting on
                        CI, or idle.
                      </li>
                      <li>
                        <b>Top-right cluster</b> (big + slow) — confirms the
                        "ship smaller PRs" argument with data.
                      </li>
                      <li>
                        <b>Bottom-right</b> (small PR, long cycle) — process
                        friction unrelated to size: bad CI, review drought, or
                        forgotten PRs.
                      </li>
                    </Text>
                    <Text size="sm">
                      Click any dot to open the PR on GitHub.
                    </Text>
                  </Stack>
                }
                height={500}
              >
                <ChartSizeCycleCorrelation
                  chartId="pr-flow-size-cycle-correlation"
                  chartData={prFlow?.sizeCycleTimeCorrelation}
                />
              </CardChart>
            </Grid.Col>
          </Grid>
        }
      />

      <Divider mt="xl" mb="md" label="Team Overview" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={200} />}
        content={<TableTeamOverview data={prFlow?.teamOverview} />}
      />
    </PageContainer>
  );
};
