import {
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Table,
} from "@mantine/core";
import { LoadableContent } from "../../../components/loadable-content";
import { useForm } from "@mantine/form";
import { Period } from "@sweetr/graphql-types/frontend/graphql";
import { IconCalendarFilled, IconRefresh } from "@tabler/icons-react";
import { endOfToday } from "date-fns";
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
  thirtyDaysAgo,
} from "../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { IconRepository, IconTeam } from "../../../providers/icon.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useCodeReviewEfficiencyMetricsQuery } from "../../../api/code-review-efficiency-metrics.api";
import { PageEmptyState } from "../../../components/page-empty-state";
import { AvatarUser } from "../../../components/avatar-user";
import { ChartCodeReviewDistribution } from "../../humans/teams/[id]/health-and-performance/components/chart-code-review-distribution";
import { CardChart } from "../../../components/card-chart";
import { CardKpi } from "../../../components/card-kpi";
import { ChartReviewSpeed } from "./components/chart-review-speed";
import { ChartSizeCommentCorrelation } from "./components/chart-size-comment-correlation";
import { TableTeamOverview } from "./components/table-team-overview";
import { CodeReviewEfficiencyFilters } from "./types";

export const CodeReviewEfficiencyPage = () => {
  const searchParams = useFilterSearchParameters();
  const { workspace } = useWorkspace();

  const filters = useForm<CodeReviewEfficiencyFilters>({
    initialValues: {
      from: searchParams.get("from") || thirtyDaysAgo().toISOString(),
      to: searchParams.get("to") || endOfToday().toISOString(),
      teamIds: searchParams.getAll<string[]>("team") || [],
      repositoryIds: searchParams.getAll<string[]>("repository") || [],
      period: (searchParams.get("period") as Period) || Period.WEEKLY,
    },
  });

  const queryInput = {
    dateRange: {
      from: filters.values.from,
      to: filters.values.to,
    },
    period: filters.values.period,
    teamIds: filters.values.teamIds.length ? filters.values.teamIds : undefined,
    repositoryIds: filters.values.repositoryIds.length
      ? filters.values.repositoryIds
      : undefined,
  };

  const queryArgs = { workspaceId: workspace.id, input: queryInput };

  const { data, isLoading } = useCodeReviewEfficiencyMetricsQuery(queryArgs);
  const metrics = data?.workspace.metrics?.codeReviewEfficiency;

  const codeReviewDistribution = metrics?.codeReviewDistribution;
  const isDistributionEmpty =
    !codeReviewDistribution?.entities.length && !isLoading;

  const reviewers = codeReviewDistribution?.entities.filter(
    (entity) => entity.reviewCount !== null,
  );

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

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={4} mt="xl">
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
            <Skeleton h={168} />
          </SimpleGrid>
        }
        content={
          <Group wrap="nowrap" mt="xl">
            <CardKpi
              name="Time to First Review"
              amount={
                metrics?.kpiTimeToFirstReview?.currentAmount
                  ? getAbbreviatedDuration(
                      Number(metrics.kpiTimeToFirstReview.currentAmount),
                    )
                  : "0s"
              }
              previousAmount={
                metrics?.kpiTimeToFirstReview?.previousAmount
                  ? getAbbreviatedDuration(
                      Number(metrics.kpiTimeToFirstReview.previousAmount),
                    )
                  : "0s"
              }
              change={metrics?.kpiTimeToFirstReview?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={metrics?.kpiTimeToFirstReview?.previousPeriod}
            />
            <CardKpi
              name="Time to Approve"
              amount={
                metrics?.kpiTimeToApproval?.currentAmount
                  ? getAbbreviatedDuration(
                      Number(metrics.kpiTimeToApproval.currentAmount),
                    )
                  : "0s"
              }
              previousAmount={
                metrics?.kpiTimeToApproval?.previousAmount
                  ? getAbbreviatedDuration(
                      Number(metrics.kpiTimeToApproval.previousAmount),
                    )
                  : "0s"
              }
              change={metrics?.kpiTimeToApproval?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={metrics?.kpiTimeToApproval?.previousPeriod}
            />
            <CardKpi
              name="Avg Comments per PR"
              amount={
                metrics?.kpiAvgCommentsPerPr?.currentAmount?.toFixed(1) ?? "0"
              }
              previousAmount={
                metrics?.kpiAvgCommentsPerPr?.previousAmount?.toFixed(1) ?? "0"
              }
              change={metrics?.kpiAvgCommentsPerPr?.change ?? 0}
              higherIsBetter={true}
              previousPeriod={metrics?.kpiAvgCommentsPerPr?.previousPeriod}
            />
            <CardKpi
              name="PRs Without Approval"
              amount={
                metrics?.kpiPrsWithoutApproval?.currentAmount?.toString() ?? "0"
              }
              previousAmount={
                metrics?.kpiPrsWithoutApproval?.previousAmount
                  ? `${metrics.kpiPrsWithoutApproval.previousAmount} PRs`
                  : "0 PRs"
              }
              change={metrics?.kpiPrsWithoutApproval?.change ?? 0}
              higherIsBetter={false}
              previousPeriod={metrics?.kpiPrsWithoutApproval?.previousPeriod}
            />
          </Group>
        }
      />

      <Divider mt="xl" mb="md" label="Review Speed" labelPosition="left" />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={<Skeleton h={340} />}
        content={
          <CardChart
            title="Review Speed"
            description="Average time from PR ready for review to first review (turnaround) and from first review to approval, per period."
            style={{ gridColumn: "span 2" }}
          >
            <ChartReviewSpeed
              chartId="cr-review-speed"
              turnaroundData={metrics?.reviewTurnaroundTime}
              approvalData={metrics?.timeToApproval}
              period={filters.values.period}
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
        whenLoading={<Skeleton h={450} />}
        content={
          <CardChart
            title="PR Size vs Comments"
            description="Scatter plot correlating PR size (lines changed) with comment count. Helps identify whether larger PRs get proportionally more review attention."
            height={450}
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

      <Paper withBorder h={500} p="xs" bg="dark.7">
        <LoadableContent
          isLoading={isLoading}
          whenLoading={<Skeleton h="100%" />}
          h="100%"
          display="flex"
          content={
            <ChartCodeReviewDistribution
              chartData={codeReviewDistribution}
              period={filters.values.period}
            />
          }
          style={
            isDistributionEmpty
              ? { alignItems: "center", justifyContent: "center" }
              : undefined
          }
          isEmpty={isDistributionEmpty}
          whenEmpty={<PageEmptyState message="No data available." />}
        />
      </Paper>

      {!isDistributionEmpty && (
        <Paper mt="md" withBorder p="xs" bg="dark.7">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Reviewer</Table.Th>
                <Table.Th ta="right">Reviews</Table.Th>
                <Table.Th ta="right">%</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reviewers?.map((reviewer) => (
                <Table.Tr key={reviewer.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <AvatarUser
                        src={reviewer.image}
                        size={24}
                        name={reviewer.name}
                      />
                      {reviewer.name}
                    </Group>
                  </Table.Td>
                  <Table.Td align="right">{reviewer.reviewCount}</Table.Td>
                  <Table.Td align="right">
                    {reviewer.reviewSharePercentage}%
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </PageContainer>
  );
};
