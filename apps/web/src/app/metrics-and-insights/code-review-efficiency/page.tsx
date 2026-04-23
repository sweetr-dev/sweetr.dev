import {
  Divider,
  Group,
  SimpleGrid,
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
import {
  getAbbreviatedDuration,
  parseNullableISO,
} from "../../../providers/date.provider";
import { IconRepository, IconTeam } from "../../../providers/icon.provider";
import { PageEmptyState } from "../../../components/page-empty-state";
import { CardChart } from "../../../components/card-chart";
import { CardKpi } from "../../../components/card-kpi";
import { ChartCodeReviewDistribution } from "./components/chart-code-review-distribution";
import { ChartReviewSpeed } from "./components/chart-review-speed";
import { ChartSizeCommentCorrelation } from "./components/chart-size-comment-correlation";
import { TableTeamOverview } from "./components/table-team-overview";
import { TableReviewDistribution } from "./components/table-review-distribution";
import { useCodeReviewEfficiencyPage } from "./useCodeReviewEfficiencyPage";

export const CodeReviewEfficiencyPage = () => {
  const {
    searchParams,
    filters,
    isLoading,
    metrics,
    kpi,
    codeReviewDistribution,
    isDistributionEmpty,
    reviewers,
    handleColumnClick,
  } = useCodeReviewEfficiencyPage();

  return (
    <PageContainer size="lg">
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

      <Divider mt="xl" mb="md" label="Overview" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={4}>
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
          </SimpleGrid>
        }
        content={
          <Group wrap="nowrap">
            <CardKpi
              name="Time to First Review"
              amount={
                kpi?.timeToFirstReview?.currentAmount
                  ? getAbbreviatedDuration(
                      Number(kpi.timeToFirstReview.currentAmount),
                    )
                  : "0s"
              }
              previousAmount={
                kpi?.timeToFirstReview?.previousAmount
                  ? getAbbreviatedDuration(
                      Number(kpi.timeToFirstReview.previousAmount),
                    )
                  : "0s"
              }
              change={kpi?.timeToFirstReview?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={kpi?.timeToFirstReview?.previousPeriod}
            />
            <CardKpi
              name="Time to Approve"
              amount={
                kpi?.timeToApproval?.currentAmount
                  ? getAbbreviatedDuration(
                      Number(kpi.timeToApproval.currentAmount),
                    )
                  : "0s"
              }
              previousAmount={
                kpi?.timeToApproval?.previousAmount
                  ? getAbbreviatedDuration(
                      Number(kpi.timeToApproval.previousAmount),
                    )
                  : "0s"
              }
              change={kpi?.timeToApproval?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={kpi?.timeToApproval?.previousPeriod}
            />
            <CardKpi
              name="Avg Comments per PR"
              amount={kpi?.avgCommentsPerPr?.currentAmount?.toFixed(1) ?? "0"}
              previousAmount={
                kpi?.avgCommentsPerPr?.previousAmount?.toFixed(1) ?? "0"
              }
              change={kpi?.avgCommentsPerPr?.change ?? 0}
              higherIsBetter={true}
              previousPeriod={kpi?.avgCommentsPerPr?.previousPeriod}
            />
            <CardKpi
              name="Merged Without Approval"
              amount={kpi?.prsWithoutApproval?.currentAmount?.toString() ?? "0"}
              previousAmount={
                kpi?.prsWithoutApproval?.previousAmount
                  ? `${kpi.prsWithoutApproval.previousAmount} PRs`
                  : "0 PRs"
              }
              change={kpi?.prsWithoutApproval?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={kpi?.prsWithoutApproval?.previousPeriod}
            />
          </Group>
        }
      />

      <Divider mt="xl" mb="md" label="Review Speed" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={500} />}
        content={
          <CardChart
            title="Review Speed"
            description={
              <Stack gap="xs">
                <Text size="sm">
                  Breaks down review latency into two stacked bars per period,
                  using <b>merged PRs</b> only:
                </Text>
                <Text size="sm" component="ul" pl="md" m={0}>
                  <li>
                    <b>Time to First Review</b> — from PR marked ready for
                    review to the first review submitted. Measures how long
                    authors wait before someone picks their PR up.
                  </li>
                  <li>
                    <b>Time to Approval</b> — from first review to the approval
                    that unblocks merge. Measures how long review conversations
                    drag on.
                  </li>
                </Text>
                <Title order={5}>Why it matters</Title>
                <Text size="sm">
                  Long turnaround kills flow: context gets stale, authors start
                  new work, and rebases pile up. Use this to spot weeks where
                  reviews stalled and decide whether the bottleneck is getting
                  attention (first review) or closing the loop (approval).
                </Text>
                <Text size="sm">
                  Click a column to drill into the PRs merged in that period.
                </Text>
              </Stack>
            }
            style={{ gridColumn: "span 2" }}
            height={500}
          >
            <ChartReviewSpeed
              chartId="cr-review-speed"
              turnaroundData={metrics?.reviewTurnaroundTime}
              approvalData={metrics?.timeToApproval}
              period={filters.values.period}
              onColumnClick={handleColumnClick}
            />
          </CardChart>
        }
      />

      <Divider mt="xl" mb="md" label="Team Overview" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={200} />}
        content={<TableTeamOverview data={metrics?.teamOverview} />}
      />

      <Divider mt="xl" mb="md" label="Review Quality" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={500} />}
        content={
          <CardChart
            title="PR Size vs Comments"
            description={
              <Stack gap="xs">
                <Text size="sm">
                  Scatter of <b>merged PRs</b> in the selected period, plotting{" "}
                  <b>lines changed</b> (log scale) against{" "}
                  <b>review comment count</b>. Each dot is one PR, colored by
                  size bucket (XS → XL). Limited to the 2,000 most recently
                  merged PRs for performance.
                </Text>
                <Title order={5}>Why it matters</Title>
                <Text size="sm">
                  A healthy review process scales attention with change size. If
                  huge PRs cluster near zero comments, you're likely
                  rubber-stamping risky changes. If tiny PRs attract long
                  threads, you may have bikeshedding or unclear conventions.
                </Text>
                <Title order={5}>What to look for</Title>
                <Text size="sm" component="ul" pl="md" m={0}>
                  <li>
                    <b>Bottom-right outliers</b> (big PR, no comments) — review
                    blind spots worth auditing.
                  </li>
                  <li>
                    <b>Top-left outliers</b> (tiny PR, many comments) —
                    contentious changes or new contributors needing support.
                  </li>
                </Text>
                <Text size="sm">Click any dot to open the PR on GitHub.</Text>
              </Stack>
            }
            height={500}
          >
            <ChartSizeCommentCorrelation
              chartId="cr-size-comment-correlation"
              chartData={metrics?.sizeCommentCorrelation}
            />
          </CardChart>
        }
      />

      <Divider
        mt="xl"
        mb="md"
        label="Review Distribution"
        labelPosition="left"
      />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={500} />}
        display="flex"
        content={
          <CardChart
            title="Review Distribution"
            description={
              <Stack gap="xs">
                <Text size="sm">
                  Graph of <b>who reviews whom</b> across the selected period.
                  Nodes are people (reviewers and authors); edges represent
                  review relationships, weighted by the number of reviews
                  exchanged.
                </Text>
                <Text size="sm">
                  Node size is relative to the <b>ideal per-reviewer load</b>{" "}
                  (total reviews ÷ number of reviewers) — bigger than average
                  means that person is pulling more weight than their share.
                </Text>
                <Title order={5}>Why it matters</Title>
                <Text size="sm">
                  Review load tends to concentrate on a few seniors, which
                  creates bottlenecks, burnout risk, and knowledge silos. A
                  healthy graph is dense and roughly evenly sized; an unhealthy
                  one has a few giant hubs and many loose ends.
                </Text>
                <Title order={5}>What to use it for</Title>
                <Text size="sm" component="ul" pl="md" m={0}>
                  <li>
                    Spot <b>review heroes</b> carrying the team and redistribute
                    load.
                  </li>
                  <li>
                    Detect <b>knowledge silos</b> — authors who only ever get
                    reviewed by the same one or two people.
                  </li>
                  <li>
                    Measure <b>cross-team review</b> by separating team members
                    from external reviewers (shown in the tooltip).
                  </li>
                </Text>
                <Text size="sm">
                  Hover a node to see their full review breakdown; drag to pan
                  and scroll to zoom.
                </Text>
              </Stack>
            }
            height={500}
          >
            <ChartCodeReviewDistribution
              chartData={codeReviewDistribution}
              period={filters.values.period}
            />
          </CardChart>
        }
        style={
          isDistributionEmpty
            ? { alignItems: "center", justifyContent: "center" }
            : undefined
        }
        isEmpty={isDistributionEmpty}
        whenEmpty={<PageEmptyState message="No data available." />}
      />

      {!isLoading && !isDistributionEmpty && (
        <TableReviewDistribution reviewers={reviewers ?? []} />
      )}
    </PageContainer>
  );
};
