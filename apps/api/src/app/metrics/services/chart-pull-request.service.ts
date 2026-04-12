import { Prisma, PullRequestSize } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import {
  PullRequestChartFilters,
  PullRequestFlowChartFilters,
} from "./chart-pull-request.types";

const innerJoinClause = Prisma.sql`
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
`;

export const getTimeToMergeChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: PullRequestChartFilters) => {
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        AVG(EXTRACT(EPOCH FROM (p."mergedAt" - pt."firstApprovalAt")) * 1000) AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE p."mergedAt" >= ${new Date(startDate)} 
        AND p."mergedAt" <= ${new Date(endDate)} 
        AND p."mergedAt" IS NOT NULL
        AND pt."firstApprovalAt" IS NOT NULL
        AND tm."teamId" = ${teamId}
        AND wm."workspaceId" = ${workspaceId}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const results =
    await getPrisma(workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      query
    );

  return results.map((result) => ({
    period: result.period.toISOString(),
    value: BigInt(Math.floor(result.value || 0)),
  }));
};

export const getTimeForFirstReviewChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: PullRequestChartFilters) => {
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, pt."firstReviewAt") AS period,
        AVG(pt."timeToFirstReview") AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE pt."firstReviewAt" >= ${new Date(startDate)} 
        AND pt."firstReviewAt" <= ${new Date(endDate)} 
        AND pt."firstReviewAt" IS NOT NULL
        AND tm."teamId" = ${teamId}
        AND wm."workspaceId" = ${workspaceId}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const results =
    await getPrisma(workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      query
    );

  return results.map((result) => ({
    period: result.period.toISOString(),
    value: BigInt(Math.floor(result.value || 0)),
  }));
};

export const getTimeForApprovalChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: PullRequestChartFilters) => {
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, pt."firstApprovalAt") AS period,
        AVG(EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000) AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE pt."firstApprovalAt" >= ${new Date(startDate)} 
        AND pt."firstApprovalAt" <= ${new Date(endDate)} 
        AND pt."firstApprovalAt" IS NOT NULL
        AND pt."firstReviewAt" IS NOT NULL
        AND tm."teamId" = ${teamId}
        AND wm."workspaceId" = ${workspaceId}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const results =
    await getPrisma(workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      query
    );

  return results.map((result) => ({
    period: result.period.toISOString(),
    value: BigInt(Math.floor(result.value || 0)),
  }));
};

export const getCycleTimeChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: PullRequestChartFilters) => {
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(endDate)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        AVG(pt."cycleTime") AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE p."mergedAt" >= ${new Date(startDate)}
        AND p."mergedAt" <= ${new Date(endDate)}
        AND p."mergedAt" IS NOT NULL
        AND tm."teamId" = ${teamId}
        AND wm."workspaceId" = ${workspaceId}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const results =
    await getPrisma(workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      query
    );

  return results.map((result) => ({
    period: result.period.toISOString(),
    value: BigInt(Math.floor(result.value || 0)),
  }));
};

export const getPullRequestSizeDistributionChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: PullRequestChartFilters) => {
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const query = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(startDate)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(endDate)}::timestamp),
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
      ${innerJoinClause}
      WHERE p."mergedAt" >= ${new Date(startDate)} 
        AND p."mergedAt" <= ${new Date(endDate)} 
        AND p."mergedAt" IS NOT NULL
        AND tm."teamId" = ${teamId}
        AND wm."workspaceId" = ${workspaceId}
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

  const results =
    await getPrisma(workspaceId).$queryRaw<
      { period: Date; size: PullRequestSize; value: number }[]
    >(query);

  const columns = [
    ...new Set(results.map((result) => result.period.toISOString())),
  ].sort();

  // We need to initialize 0 for every size for every column
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

  results.forEach((result) => {
    const data = seriesMap.get(result.period.toISOString());

    if (data) {
      data[result.size] = BigInt(result.value);
      return;
    }

    throw new BusinessRuleException("Chart error: Missing data for column", {
      extra: { workspaceId, teamId, startDate, endDate, period },
    });
  });

  const series = Array.from(seriesMap.values());

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
  };
};

// ---------------------------------------------------------------------------
// Workspace-level PR Flow queries (multi-filter, no single teamId required)
// ---------------------------------------------------------------------------

interface PullRequestFiltersResult {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}

const buildPullRequestFilters = (
  filters: PullRequestFlowChartFilters
): PullRequestFiltersResult => {
  const joins: Prisma.Sql[] = [
    Prisma.sql`INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"`,
    Prisma.sql`INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"`,
    Prisma.sql`INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"`,
  ];
  const conditions: Prisma.Sql[] = [
    Prisma.sql`wm."workspaceId" = ${filters.workspaceId}`,
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
    statuses AS (
      SELECT unnest(ARRAY['MERGED', 'CLOSED']::"PullRequestState"[]) AS status
    ),
    period_status_combos AS (
      SELECT periods.period, statuses.status
      FROM periods
      CROSS JOIN statuses
    ),
    merged_data AS (
      SELECT
        DATE_TRUNC(${trunc}, p."mergedAt") AS period,
        'MERGED'::"PullRequestState" AS status,
        COUNT(p."id") AS value
      FROM "PullRequest" p
      INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
      INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
      WHERE wm."workspaceId" = ${filters.workspaceId}
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
        'CLOSED'::"PullRequestState" AS status,
        COUNT(p."id") AS value
      FROM "PullRequest" p
      INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
      INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
      WHERE wm."workspaceId" = ${filters.workspaceId}
        AND p."closedAt" >= ${new Date(filters.startDate)}
        AND p."closedAt" <= ${new Date(filters.endDate)}
        AND p."closedAt" IS NOT NULL
        AND p."mergedAt" IS NULL
        AND p."state" = 'CLOSED'::"PullRequestState"
        ${teamFilter}
        ${repoFilter}
      GROUP BY period
    ),
    data AS (
      SELECT * FROM merged_data
      UNION ALL
      SELECT * FROM closed_data
    )
    SELECT
      period_status_combos.period,
      period_status_combos.status,
      COALESCE(data.value, 0) AS value
    FROM period_status_combos
    LEFT JOIN data ON period_status_combos.period = data.period
      AND period_status_combos.status = data.status
    ORDER BY period_status_combos.period ASC, period_status_combos.status ASC;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; status: string; value: number }[]
  >(query);

  const columns = [
    ...new Set(results.map((result) => result.period.toISOString())),
  ].sort();

  const mergedByPeriod = new Map<string, bigint>(
    columns.map((key) => [key, BigInt(0)])
  );
  const closedByPeriod = new Map<string, bigint>(
    columns.map((key) => [key, BigInt(0)])
  );

  results.forEach((result) => {
    const periodKey = result.period.toISOString();
    if (result.status === "MERGED") {
      mergedByPeriod.set(periodKey, BigInt(result.value));
    } else {
      closedByPeriod.set(periodKey, BigInt(result.value));
    }
  });

  return {
    columns,
    series: [
      {
        name: "Merged",
        color: "#8ce99a",
        data: columns.map((col) => mergedByPeriod.get(col) || BigInt(0)),
      },
      {
        name: "Closed",
        color: "#ff8787",
        data: columns.map((col) => closedByPeriod.get(col) || BigInt(0)),
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
    prisma.$queryRaw<
      { period: Date; size: PullRequestSize; value: number }[]
    >(sizeQuery),
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
  [PullRequestSize.TINY]: { name: "Tiny", color: "#8ce99a" },
  [PullRequestSize.SMALL]: { name: "Small", color: "#8ce99a" },
  [PullRequestSize.MEDIUM]: { name: "Medium", color: "#FFEC99" },
  [PullRequestSize.LARGE]: { name: "Large", color: "#FF6B6B" },
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
