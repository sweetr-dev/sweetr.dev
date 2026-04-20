import { Prisma, PullRequestSize } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import {
  CycleTimeBreakdownResult,
  CycleTimeBreakdownRow,
  PullRequestFiltersResult,
  PullRequestFlowChartFilters,
} from "./pr-flow.types";

const buildPullRequestFilters = (
  filters: PullRequestFlowChartFilters
): PullRequestFiltersResult => {
  const joins: Prisma.Sql[] = [
    Prisma.sql`INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"`,
    Prisma.sql`INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"`,
  ];
  const conditions: Prisma.Sql[] = [
    Prisma.sql`pt."workspaceId" = ${filters.workspaceId}`,
    Prisma.sql`p."workspaceId" = ${filters.workspaceId}`,
  ];

  if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "TeamMember" tm
        WHERE tm."gitProfileId" = p."authorId"
        AND tm."workspaceId" = ${filters.workspaceId}
        AND tm."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
      )`
    );
  }

  if (filters.repositoryIds && filters.repositoryIds.length > 0) {
    conditions.push(
      Prisma.sql`p."repositoryId" = ANY(ARRAY[${Prisma.join(
        filters.repositoryIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  return { joins, conditions };
};

const buildPrFlowTimeQuery = (
  filters: PullRequestFlowChartFilters,
  dateColumn: Prisma.Sql,
  valueExpression: Prisma.Sql,
  dateFilter: Prisma.Sql
) => {
  const trunc = periodToDateTrunc(filters.period);
  const interval = periodToInterval(filters.period);
  const { joins, conditions } = buildPullRequestFilters(filters);

  const allConditions = [
    ...conditions,
    dateFilter,
    Prisma.sql`${dateColumn} IS NOT NULL`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  return Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(filters.startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(filters.endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT
        DATE_TRUNC(${trunc}, ${dateColumn}) AS period,
        ${valueExpression} AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;
};

export const getWorkspaceTimeToMergeChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildPrFlowTimeQuery(
    filters,
    Prisma.sql`p."mergedAt"`,
    Prisma.sql`AVG(EXTRACT(EPOCH FROM (p."mergedAt" - pt."firstApprovalAt")) * 1000)`,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)} AND p."mergedAt" <= ${new Date(filters.endDate)} AND pt."firstApprovalAt" IS NOT NULL`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    value: BigInt(Math.floor(r.value || 0)),
  }));
};

export const getWorkspaceTimeToCodeChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildPrFlowTimeQuery(
    filters,
    Prisma.sql`p."mergedAt"`,
    Prisma.sql`AVG(pt."timeToCode")`,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)} AND p."mergedAt" <= ${new Date(filters.endDate)} AND pt."timeToCode" IS NOT NULL`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    value: BigInt(Math.floor(r.value || 0)),
  }));
};

export const getWorkspaceTimeForFirstReviewChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildPrFlowTimeQuery(
    filters,
    Prisma.sql`pt."firstReviewAt"`,
    Prisma.sql`AVG(pt."timeToFirstReview")`,
    Prisma.sql`pt."firstReviewAt" >= ${new Date(filters.startDate)} AND pt."firstReviewAt" <= ${new Date(filters.endDate)}`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    value: BigInt(Math.floor(r.value || 0)),
  }));
};

export const getWorkspaceTimeForApprovalChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildPrFlowTimeQuery(
    filters,
    Prisma.sql`pt."firstApprovalAt"`,
    Prisma.sql`AVG(EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000)`,
    Prisma.sql`pt."firstApprovalAt" >= ${new Date(filters.startDate)} AND pt."firstApprovalAt" <= ${new Date(filters.endDate)} AND pt."firstReviewAt" IS NOT NULL`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    value: BigInt(Math.floor(r.value || 0)),
  }));
};

export const getWorkspaceCycleTimeChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildPrFlowTimeQuery(
    filters,
    Prisma.sql`p."mergedAt"`,
    Prisma.sql`AVG(pt."cycleTime")`,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)} AND p."mergedAt" <= ${new Date(filters.endDate)}`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    value: BigInt(Math.floor(r.value || 0)),
  }));
};

export const getWorkspaceCycleTimeBreakdownChartData = async (
  filters: PullRequestFlowChartFilters
): Promise<CycleTimeBreakdownResult[]> => {
  const trunc = periodToDateTrunc(filters.period);
  const interval = periodToInterval(filters.period);
  const { joins, conditions } = buildPullRequestFilters(filters);

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(filters.endDate)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
    Prisma.sql`pt."cycleTime" IS NOT NULL`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(filters.startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(filters.endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    per_pr_raw AS (
      SELECT
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        pt."cycleTime" AS cycle_time,
        GREATEST(COALESCE(
          CASE WHEN pt."firstReviewAt" IS NOT NULL
            THEN EXTRACT(EPOCH FROM (pt."firstReviewAt" - COALESCE(pt."firstReadyAt", p."createdAt"))) * 1000
          END, 0
        ), 0) AS raw_first_review,
        GREATEST(COALESCE(
          CASE WHEN pt."firstApprovalAt" IS NOT NULL AND pt."firstReviewAt" IS NOT NULL
            THEN EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000
          END, 0
        ), 0) AS raw_approve,
        GREATEST(COALESCE(
          CASE WHEN pt."firstApprovalAt" IS NOT NULL
            THEN EXTRACT(EPOCH FROM (p."mergedAt" - pt."firstApprovalAt")) * 1000
          END, 0
        ), 0) AS raw_merge
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause}
    ),
    per_pr_balanced AS (
      SELECT period, cycle_time,
        CASE WHEN raw_sum > cycle_time AND raw_sum > 0 THEN
          cycle_time * raw_first_review / raw_sum
        ELSE raw_first_review END AS time_to_first_review,
        CASE WHEN raw_sum > cycle_time AND raw_sum > 0 THEN
          cycle_time * raw_approve / raw_sum
        ELSE raw_approve END AS time_to_approve,
        CASE WHEN raw_sum > cycle_time AND raw_sum > 0 THEN
          cycle_time * raw_merge / raw_sum
        ELSE raw_merge END AS time_to_merge,
        CASE WHEN raw_sum > cycle_time THEN 0
        ELSE GREATEST(cycle_time - raw_sum, 0) END AS time_to_code
      FROM (
        SELECT *, raw_first_review + raw_approve + raw_merge AS raw_sum
        FROM per_pr_raw
      ) sub
    ),
    data AS (
      SELECT
        period,
        AVG(cycle_time)            AS cycle_time,
        AVG(time_to_code)          AS time_to_code,
        AVG(time_to_first_review)  AS time_to_first_review,
        AVG(time_to_approve)       AS time_to_approve,
        AVG(time_to_merge)         AS time_to_merge
      FROM per_pr_balanced
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.cycle_time, 0)            AS cycle_time,
      COALESCE(data.time_to_code, 0)          AS time_to_code,
      COALESCE(data.time_to_first_review, 0)  AS time_to_first_review,
      COALESCE(data.time_to_approve, 0)       AS time_to_approval,
      COALESCE(data.time_to_merge, 0)         AS time_to_merge
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    CycleTimeBreakdownRow[]
  >(query);

  return results.map((r) => ({
    period: r.period.toISOString(),
    cycleTime: BigInt(Math.floor(r.cycle_time || 0)),
    timeToCode: BigInt(Math.floor(r.time_to_code || 0)),
    timeToFirstReview: BigInt(Math.floor(r.time_to_first_review || 0)),
    timeToApproval: BigInt(Math.floor(r.time_to_approval || 0)),
    timeToMerge: BigInt(Math.floor(r.time_to_merge || 0)),
  }));
};

export const getWorkspaceThroughputChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const trunc = periodToDateTrunc(filters.period);
  const interval = periodToInterval(filters.period);

  const teamFilter =
    filters.teamIds && filters.teamIds.length > 0
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "TeamMember" tm
          WHERE tm."gitProfileId" = p."authorId"
          AND tm."workspaceId" = ${filters.workspaceId}
          AND tm."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
        )`
      : Prisma.empty;

  const repoFilter =
    filters.repositoryIds && filters.repositoryIds.length > 0
      ? Prisma.sql`AND p."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      : Prisma.empty;

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(filters.startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(filters.endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    opened_data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."createdAt") AS period,
        COUNT(p."id") AS value
      FROM "PullRequest" p
      WHERE p."workspaceId" = ${filters.workspaceId}
        AND p."createdAt" >= ${new Date(filters.startDate)}
        AND p."createdAt" <= ${new Date(filters.endDate)}
        ${teamFilter}
        ${repoFilter}
      GROUP BY period
    ),
    merged_data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        COUNT(p."id") AS value
      FROM "PullRequest" p
      WHERE p."workspaceId" = ${filters.workspaceId}
        AND p."mergedAt" >= ${new Date(filters.startDate)}
        AND p."mergedAt" <= ${new Date(filters.endDate)}
        AND p."mergedAt" IS NOT NULL
        ${teamFilter}
        ${repoFilter}
      GROUP BY period
    ),
    closed_data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."closedAt") AS period,
        COUNT(p."id") AS value
      FROM "PullRequest" p
      WHERE p."workspaceId" = ${filters.workspaceId}
        AND p."closedAt" >= ${new Date(filters.startDate)}
        AND p."closedAt" <= ${new Date(filters.endDate)}
        AND p."closedAt" IS NOT NULL
        AND p."mergedAt" IS NULL
        AND p."state" = 'CLOSED'::"PullRequestState"
        ${teamFilter}
        ${repoFilter}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(o.value, 0) AS opened,
      COALESCE(m.value, 0) AS merged,
      COALESCE(c.value, 0) AS closed
    FROM periods
    LEFT JOIN opened_data o ON periods.period = o.period
    LEFT JOIN merged_data m ON periods.period = m.period
    LEFT JOIN closed_data c ON periods.period = c.period
    ORDER BY periods.period ASC;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; opened: number; merged: number; closed: number }[]
  >(query);

  const columns = results.map((r) => r.period.toISOString());

  return {
    columns,
    series: [
      {
        name: "Opened",
        color: "#8ce99a",
        data: results.map((r) => BigInt(r.opened)),
      },
      {
        name: "Merged",
        color: "#b197fc",
        data: results.map((r) => BigInt(r.merged)),
      },
      {
        name: "Closed",
        color: "#ff8787",
        data: results.map((r) => BigInt(r.closed)),
      },
    ],
  };
};

export const getWorkspacePullRequestSizeDistributionChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const trunc = periodToDateTrunc(filters.period);
  const interval = periodToInterval(filters.period);
  const { joins, conditions } = buildPullRequestFilters(filters);

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(filters.endDate)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  const sizeQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(filters.startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(filters.endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    sizes AS (
      SELECT unnest(ARRAY['TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE']::"PullRequestSize"[]) AS size
    ),
    period_size_combos AS (
      SELECT periods.period, sizes.size
      FROM periods
      CROSS JOIN sizes
    ),
    data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        pt.size AS size,
        COUNT(p."id") AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY period, size
    )
    SELECT
      period_size_combos.period,
      period_size_combos.size,
      COALESCE(data.value, 0) AS value
    FROM period_size_combos
    LEFT JOIN data ON period_size_combos.period = data.period
      AND period_size_combos.size = data.size
    ORDER BY period_size_combos.period ASC, period_size_combos.size ASC;
  `;

  const avgQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(filters.startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(filters.endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        AVG(pt."linesAddedCount" + pt."linesDeletedCount") AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const prisma = getPrisma(filters.workspaceId);

  const [sizeResults, avgResults] = await Promise.all([
    prisma.$queryRaw<{ period: Date; size: PullRequestSize; value: number }[]>(
      sizeQuery
    ),
    prisma.$queryRaw<{ period: Date; value: number }[]>(avgQuery),
  ]);

  const columns = [
    ...new Set(sizeResults.map((result) => result.period.toISOString())),
  ].sort();

  const seriesMap = new Map<string, Record<PullRequestSize, bigint>>(
    columns.map((key) => [
      key,
      {
        [PullRequestSize.TINY]: BigInt(0),
        [PullRequestSize.SMALL]: BigInt(0),
        [PullRequestSize.MEDIUM]: BigInt(0),
        [PullRequestSize.LARGE]: BigInt(0),
        [PullRequestSize.HUGE]: BigInt(0),
      },
    ])
  );

  sizeResults.forEach((result) => {
    const data = seriesMap.get(result.period.toISOString());

    if (data) {
      data[result.size] = BigInt(result.value);
      return;
    }

    throw new BusinessRuleException("Chart error: Missing data for column", {
      extra: {
        workspaceId: filters.workspaceId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period,
      },
    });
  });

  const series = Array.from(seriesMap.values());

  const avgByPeriod = new Map<string, number>(
    avgResults.map((r) => [r.period.toISOString(), Math.round(Number(r.value))])
  );

  return {
    columns,
    series: [
      {
        name: "Tiny",
        color: "#8ce99a",
        data: series.map((data) => data.TINY),
      },
      {
        name: "Small",
        color: "#8ce99a",
        data: series.map((data) => data.SMALL),
      },
      {
        name: "Medium",
        color: "#FFEC99",
        data: series.map((data) => data.MEDIUM),
      },
      {
        name: "Large",
        color: "#FF6B6B",
        data: series.map((data) => data.LARGE),
      },
      {
        name: "Huge",
        color: "#FF6B6B",
        data: series.map((data) => data.HUGE),
      },
    ],
    averageLinesChanged: columns.map((col) => avgByPeriod.get(col) ?? 0),
  };
};

// ---------------------------------------------------------------------------
// Size vs Cycle Time Correlation (scatter chart)
// ---------------------------------------------------------------------------

const SIZE_SERIES_CONFIG: Record<
  PullRequestSize,
  { name: string; color: string }
> = {
  [PullRequestSize.TINY]: { name: "Tiny", color: "#8ce9e3" },
  [PullRequestSize.SMALL]: { name: "Small", color: "#8ce99a" },
  [PullRequestSize.MEDIUM]: { name: "Medium", color: "#FFEC99" },
  [PullRequestSize.LARGE]: { name: "Large", color: "#ffb76b" },
  [PullRequestSize.HUGE]: { name: "Huge", color: "#FF6B6B" },
};

export const getWorkspaceSizeCycleTimeCorrelation = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
) => {
  const { joins, conditions } = buildPullRequestFilters(
    filters as PullRequestFlowChartFilters
  );

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(filters.endDate)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
    Prisma.sql`pt."cycleTime" IS NOT NULL`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  const query = Prisma.sql`
    SELECT
      pt."cycleTime" AS cycle_time,
      (pt."linesAddedCount" + pt."linesDeletedCount") AS lines_changed,
      pt."size" AS size,
      p."title",
      p."gitUrl" AS url
    FROM "PullRequestTracking" pt
    ${joinClause}
    WHERE ${whereClause}
    ORDER BY pt."cycleTime" ASC
    LIMIT 2000;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    {
      cycle_time: bigint;
      lines_changed: number;
      size: PullRequestSize;
      title: string;
      url: string;
    }[]
  >(query);

  const grouped = new Map<PullRequestSize, typeof results>();

  for (const row of results) {
    const bucket = grouped.get(row.size) ?? [];
    bucket.push(row);
    grouped.set(row.size, bucket);
  }

  const sizeOrder: PullRequestSize[] = [
    PullRequestSize.TINY,
    PullRequestSize.SMALL,
    PullRequestSize.MEDIUM,
    PullRequestSize.LARGE,
    PullRequestSize.HUGE,
  ];

  return {
    series: sizeOrder
      .filter((size) => grouped.has(size))
      .map((size) => {
        const config = SIZE_SERIES_CONFIG[size];
        const rows = grouped.get(size)!;
        return {
          name: config.name,
          color: config.color,
          data: rows.map((r) => ({
            x: Number(r.cycle_time) / 3_600_000,
            y: r.lines_changed,
            title: r.title,
            url: r.url,
          })),
        };
      }),
  };
};

interface TeamOverviewRow {
  team_id: number | null;
  team_name: string;
  team_icon: string;
  median_cycle_time: number;
  merged_count: bigint;
  avg_lines_changed: number;
  pct_big_prs: number;
}

export const getWorkspaceTeamOverview = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
) => {
  const { joins, conditions } = buildPullRequestFilters(
    filters as PullRequestFlowChartFilters
  );

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(filters.endDate)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  const teamFilter =
    filters.teamIds && filters.teamIds.length > 0
      ? Prisma.sql`AND t."id" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      : Prisma.empty;

  const query = Prisma.sql`
    WITH org_data AS (
      SELECT
        NULL::integer AS team_id,
        'All teams' AS team_name,
        '' AS team_icon,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pt."cycleTime") AS median_cycle_time,
        COUNT(p."id") AS merged_count,
        AVG(pt."linesAddedCount" + pt."linesDeletedCount") AS avg_lines_changed,
        COUNT(*) FILTER (WHERE pt.size IN ('LARGE'::"PullRequestSize", 'HUGE'::"PullRequestSize")) * 100.0
          / NULLIF(COUNT(*), 0) AS pct_big_prs
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause}
    ),
    all_teams AS (
      SELECT t."id", t."name", t."icon"
      FROM "Team" t
      WHERE t."workspaceId" = ${filters.workspaceId}
        AND t."archivedAt" IS NULL
        ${teamFilter}
    ),
    pr_per_team AS (
      SELECT
        tm2."teamId" AS team_id,
        pt."cycleTime",
        pt."linesAddedCount",
        pt."linesDeletedCount",
        pt.size,
        p."id" AS pr_id
      FROM "PullRequestTracking" pt
      ${joinClause}
      INNER JOIN "TeamMember" tm2 ON gp."id" = tm2."gitProfileId"
        AND tm2."workspaceId" = ${filters.workspaceId}
      WHERE ${whereClause}
    ),
    team_data AS (
      SELECT
        at."id" AS team_id,
        at."name" AS team_name,
        at."icon" AS team_icon,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ppt."cycleTime") AS median_cycle_time,
        COUNT(ppt.pr_id) AS merged_count,
        AVG(ppt."linesAddedCount" + ppt."linesDeletedCount") AS avg_lines_changed,
        COUNT(*) FILTER (WHERE ppt.size IN ('LARGE'::"PullRequestSize", 'HUGE'::"PullRequestSize")) * 100.0
          / NULLIF(COUNT(ppt.pr_id), 0) AS pct_big_prs
      FROM all_teams at
      LEFT JOIN pr_per_team ppt ON ppt.team_id = at."id"
      GROUP BY at."id", at."name", at."icon"
    )
    SELECT * FROM org_data
    UNION ALL
    SELECT * FROM team_data
    ORDER BY team_id NULLS FIRST, team_name ASC;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    TeamOverviewRow[]
  >(query);

  return results.map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    teamIcon: r.team_icon,
    medianCycleTime: BigInt(Math.floor(Number(r.median_cycle_time) || 0)),
    mergedCount: Number(r.merged_count),
    avgLinesChanged: Math.round(Number(r.avg_lines_changed) || 0),
    pctBigPrs: Math.round(Number(r.pct_big_prs) || 0),
  }));
};
