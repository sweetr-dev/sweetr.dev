import { Prisma, PullRequestSize } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { getPreviousPeriod } from "../../../lib/date";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import { PullRequestFlowChartFilters } from "./pr-flow.types";
import {
  CodeReviewDistributionRow,
  CodeReviewLink,
} from "./chart-code-review-efficiency.types";
import { sort, sum } from "radash";
import { roundDecimalPoints } from "../../../lib/number";

interface CodeReviewEfficiencyFiltersResult {
  joins: Prisma.Sql[];
  conditions: Prisma.Sql[];
}

const buildCodeReviewFilters = (
  filters: PullRequestFlowChartFilters
): CodeReviewEfficiencyFiltersResult => {
  const joins: Prisma.Sql[] = [
    Prisma.sql`INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"`,
    Prisma.sql`INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"`,
  ];
  const conditions: Prisma.Sql[] = [
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

const buildTimeSeriesQuery = (
  filters: PullRequestFlowChartFilters,
  dateColumn: Prisma.Sql,
  valueExpression: Prisma.Sql,
  dateFilter: Prisma.Sql
) => {
  const trunc = periodToDateTrunc(filters.period);
  const interval = periodToInterval(filters.period);
  const { joins, conditions } = buildCodeReviewFilters(filters);

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

export const getWorkspaceReviewTurnaroundTime = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildTimeSeriesQuery(
    filters,
    Prisma.sql`pt."firstReviewAt"`,
    Prisma.sql`AVG(pt."timeToFirstReview")`,
    Prisma.sql`pt."firstReviewAt" >= ${new Date(filters.startDate)} AND pt."firstReviewAt" <= ${new Date(filters.endDate)}`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return {
    columns: results.map((r) => r.period.toISOString()),
    data: results.map((r) => BigInt(Math.floor(r.value || 0))),
  };
};

export const getWorkspaceTimeToApprovalChart = async (
  filters: PullRequestFlowChartFilters
) => {
  const query = buildTimeSeriesQuery(
    filters,
    Prisma.sql`pt."firstApprovalAt"`,
    Prisma.sql`AVG(EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000)`,
    Prisma.sql`pt."firstApprovalAt" >= ${new Date(filters.startDate)} AND pt."firstApprovalAt" <= ${new Date(filters.endDate)} AND pt."firstReviewAt" IS NOT NULL`
  );

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { period: Date; value: number }[]
  >(query);

  return {
    columns: results.map((r) => r.period.toISOString()),
    data: results.map((r) => BigInt(Math.floor(r.value || 0))),
  };
};

export const getWorkspacePrsWithoutApproval = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
) => {
  const { joins, conditions } = buildCodeReviewFilters(
    filters as PullRequestFlowChartFilters
  );

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(filters.startDate)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(filters.endDate)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
    Prisma.sql`NOT EXISTS (
      SELECT 1 FROM "CodeReview" cr
      WHERE cr."pullRequestId" = p."id"
      AND cr."state" = 'APPROVED'::"CodeReviewState"
    )`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  const query = Prisma.sql`
    SELECT COUNT(DISTINCT p."id") AS count
    FROM "PullRequestTracking" pt
    ${joinClause}
    WHERE ${whereClause};
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { count: bigint }[]
  >(query);

  return Number(results[0]?.count ?? 0);
};

// ---- KPI helpers (current vs previous period with % change) ----

export interface CodeReviewKpiResult {
  currentAmount: bigint;
  previousAmount: bigint;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface CodeReviewCountKpiResult {
  currentAmount: number;
  previousAmount: number;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

export interface AvgCommentsKpiResult {
  currentAmount: number;
  previousAmount: number;
  change: number;
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
}

const buildPrsWithoutApprovalCountQuery = (
  filters: Omit<PullRequestFlowChartFilters, "period">,
  from: string,
  to: string
) => {
  const { joins, conditions } = buildCodeReviewFilters(
    filters as PullRequestFlowChartFilters
  );

  const allConditions = [
    ...conditions,
    Prisma.sql`p."mergedAt" >= ${new Date(from)}`,
    Prisma.sql`p."mergedAt" <= ${new Date(to)}`,
    Prisma.sql`p."mergedAt" IS NOT NULL`,
    Prisma.sql`NOT EXISTS (
      SELECT 1 FROM "CodeReview" cr
      WHERE cr."pullRequestId" = p."id"
      AND cr."state" = 'APPROVED'::"CodeReviewState"
    )`,
  ];

  const joinClause = Prisma.join(joins, " ");
  const whereClause = Prisma.join(allConditions, " AND ");

  return Prisma.sql`
    SELECT COUNT(DISTINCT p."id") AS count
    FROM "PullRequestTracking" pt
    ${joinClause}
    WHERE ${whereClause};
  `;
};

export const getKpiTimeToFirstReview = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
): Promise<CodeReviewKpiResult> => {
  const { startDate: from, endDate: to } = filters;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const buildQuery = (queryFrom: string, queryTo: string) => {
    const { joins, conditions } = buildCodeReviewFilters(
      filters as PullRequestFlowChartFilters
    );
    const allConditions = [
      ...conditions,
      Prisma.sql`pt."firstReviewAt" >= ${new Date(queryFrom)}`,
      Prisma.sql`pt."firstReviewAt" <= ${new Date(queryTo)}`,
      Prisma.sql`pt."firstReviewAt" IS NOT NULL`,
    ];
    const joinClause = Prisma.join(joins, " ");
    const whereClause = Prisma.join(allConditions, " AND ");

    return Prisma.sql`
      SELECT AVG(pt."timeToFirstReview") AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause};
    `;
  };

  const prisma = getPrisma(filters.workspaceId);
  const [currentResult, previousResult] = await Promise.all([
    prisma.$queryRaw<{ value: number | null }[]>(buildQuery(from, to)),
    prisma.$queryRaw<{ value: number | null }[]>(
      buildQuery(beforeFrom, beforeTo)
    ),
  ]);

  const currentAmount = Math.floor(currentResult[0]?.value || 0);
  const previousAmount = Math.floor(previousResult[0]?.value || 0);
  const change =
    previousAmount !== 0
      ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
      : 0;

  return {
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

export const getKpiTimeToApproval = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
): Promise<CodeReviewKpiResult> => {
  const { startDate: from, endDate: to } = filters;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const buildQuery = (queryFrom: string, queryTo: string) => {
    const { joins, conditions } = buildCodeReviewFilters(
      filters as PullRequestFlowChartFilters
    );
    const allConditions = [
      ...conditions,
      Prisma.sql`pt."firstApprovalAt" >= ${new Date(queryFrom)}`,
      Prisma.sql`pt."firstApprovalAt" <= ${new Date(queryTo)}`,
      Prisma.sql`pt."firstApprovalAt" IS NOT NULL`,
      Prisma.sql`pt."firstReviewAt" IS NOT NULL`,
    ];
    const joinClause = Prisma.join(joins, " ");
    const whereClause = Prisma.join(allConditions, " AND ");

    return Prisma.sql`
      SELECT AVG(EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000) AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause};
    `;
  };

  const prisma = getPrisma(filters.workspaceId);
  const [currentResult, previousResult] = await Promise.all([
    prisma.$queryRaw<{ value: number | null }[]>(buildQuery(from, to)),
    prisma.$queryRaw<{ value: number | null }[]>(
      buildQuery(beforeFrom, beforeTo)
    ),
  ]);

  const currentAmount = Math.floor(currentResult[0]?.value || 0);
  const previousAmount = Math.floor(previousResult[0]?.value || 0);
  const change =
    previousAmount !== 0
      ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
      : 0;

  return {
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

export const getKpiAvgCommentsPerPr = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
): Promise<AvgCommentsKpiResult> => {
  const { startDate: from, endDate: to } = filters;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const buildQuery = (queryFrom: string, queryTo: string) => {
    const { joins, conditions } = buildCodeReviewFilters(
      filters as PullRequestFlowChartFilters
    );
    const allConditions = [
      ...conditions,
      Prisma.sql`p."mergedAt" >= ${new Date(queryFrom)}`,
      Prisma.sql`p."mergedAt" <= ${new Date(queryTo)}`,
      Prisma.sql`p."mergedAt" IS NOT NULL`,
    ];
    const joinClause = Prisma.join(joins, " ");
    const whereClause = Prisma.join(allConditions, " AND ");

    return Prisma.sql`
      SELECT AVG(p."commentCount")::double precision AS value
      FROM "PullRequestTracking" pt
      ${joinClause}
      WHERE ${whereClause};
    `;
  };

  const prisma = getPrisma(filters.workspaceId);
  const [currentResult, previousResult] = await Promise.all([
    prisma.$queryRaw<{ value: number | null }[]>(buildQuery(from, to)),
    prisma.$queryRaw<{ value: number | null }[]>(
      buildQuery(beforeFrom, beforeTo)
    ),
  ]);

  const currentAmount = Math.round((currentResult[0]?.value || 0) * 10) / 10;
  const previousAmount = Math.round((previousResult[0]?.value || 0) * 10) / 10;
  const change =
    previousAmount !== 0
      ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
      : 0;

  return {
    currentAmount,
    previousAmount,
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

export const getKpiPrsWithoutApproval = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
): Promise<CodeReviewCountKpiResult> => {
  const { startDate: from, endDate: to } = filters;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const prisma = getPrisma(filters.workspaceId);
  const [currentResult, previousResult] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>(
      buildPrsWithoutApprovalCountQuery(filters, from, to)
    ),
    prisma.$queryRaw<{ count: bigint }[]>(
      buildPrsWithoutApprovalCountQuery(filters, beforeFrom, beforeTo)
    ),
  ]);

  const currentAmount = Number(currentResult[0]?.count ?? 0);
  const previousAmount = Number(previousResult[0]?.count ?? 0);
  const change =
    previousAmount !== 0
      ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
      : 0;

  return {
    currentAmount,
    previousAmount,
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

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

export const getWorkspaceSizeCommentCorrelation = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
) => {
  const { joins, conditions } = buildCodeReviewFilters(
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

  const query = Prisma.sql`
    SELECT
      (pt."linesAddedCount" + pt."linesDeletedCount") AS lines_changed,
      p."commentCount" AS comment_count,
      pt."size" AS size,
      p."title",
      p."gitUrl" AS url
    FROM "PullRequestTracking" pt
    ${joinClause}
    WHERE ${whereClause}
    ORDER BY p."commentCount" DESC
    LIMIT 2000;
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    {
      lines_changed: number;
      comment_count: number;
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
            x: r.lines_changed,
            y: Number(r.comment_count),
            title: r.title,
            url: r.url,
          })),
        };
      }),
  };
};

// ---- Code Review Distribution (moved from chart-code-review.service.ts) ----

const processCodeReviewDistributionRows = (
  results: CodeReviewDistributionRow[]
) => {
  const totalReviewsPerReviewer: Record<string, number> = {};

  const links: CodeReviewLink[] = results.map((result) => {
    totalReviewsPerReviewer[result.source] =
      (totalReviewsPerReviewer[result.source] || 0) + result.value;

    return {
      source: result.source,
      target: result.target,
      isFromTeam: !!result.isTargetFromTeam,
      value: result.value,
    };
  });

  const combinedLinksMap: Map<string, CodeReviewLink> = new Map();

  links.forEach((link) => {
    const key = `${link.source}-${link.target}`;
    const existingLink = combinedLinksMap.get(key);

    if (existingLink) {
      existingLink.value += link.value;
      return;
    }

    combinedLinksMap.set(key, { ...link });
  });

  const combinedLinks: CodeReviewLink[] = Array.from(combinedLinksMap.values());

  const entities = results
    .map((result) => [
      {
        id: result.source,
        name: result.crAuthorName,
        image: result.crAuthorAvatar,
        reviewCount: totalReviewsPerReviewer[result.source] as number,
      },
      {
        id: result.target,
        name: result.prAuthorName,
        image: result.prAuthorAvatar,
        reviewCount: undefined,
      },
    ])
    .flat();

  const uniqueEntities = [...new Map(entities.map((v) => [v.id, v])).values()];

  const totalReviews = sum(
    uniqueEntities,
    (entity) => (entity.reviewCount || 0) as number
  );

  const sortedEntities = sort(
    uniqueEntities,
    (entity) => (entity.reviewCount || 0) as number,
    true
  );

  const sortedEntitiesWithSharePercentage = sortedEntities.map((entity) => ({
    ...entity,
    reviewSharePercentage: entity.reviewCount
      ? roundDecimalPoints((entity.reviewCount * 100) / totalReviews)
      : undefined,
  }));

  return {
    entities: sortedEntitiesWithSharePercentage,
    links: combinedLinks,
    totalReviews,
  };
};

export const getWorkspaceCodeReviewDistributionChartData = async (
  filters: PullRequestFlowChartFilters
) => {
  const teamFilter =
    filters.teamIds && filters.teamIds.length > 0
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "TeamMember" tm
          WHERE tm."gitProfileId" = CR_Author."id"
          AND tm."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
        )`
      : Prisma.empty;

  const repoFilter =
    filters.repositoryIds && filters.repositoryIds.length > 0
      ? Prisma.sql`AND "PullRequest"."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      : Prisma.empty;

  const query = Prisma.sql`
  SELECT
    CONCAT('cr-author:', CR_Author."handle") AS source,
    CONCAT(PR_Author."handle", ':', CR_Author."name") AS target,
    EXISTS (
      SELECT 1
      FROM "TeamMember" tm_cr
      JOIN "TeamMember" tm_pr ON tm_cr."teamId" = tm_pr."teamId"
      WHERE tm_cr."gitProfileId" = CR_Author."id"
        AND tm_pr."gitProfileId" = PR_Author."id"
    ) AS "isTargetFromTeam",
    CR_Author."name" AS "crAuthorName",
    CR_Author."avatar" AS "crAuthorAvatar",
    PR_Author."name" AS "prAuthorName",
    PR_Author."avatar" AS "prAuthorAvatar",
    COUNT(*) AS value
  FROM
    "CodeReview"
  JOIN
    "PullRequest" ON "CodeReview"."pullRequestId" = "PullRequest".id
  JOIN
    "GitProfile" AS CR_Author ON "CodeReview"."authorId" = CR_Author.id
  JOIN
    "GitProfile" AS PR_Author ON "PullRequest"."authorId" = PR_Author.id
  WHERE
    "CodeReview"."createdAt" >= ${new Date(filters.startDate)}
    AND "CodeReview"."createdAt" <= ${new Date(filters.endDate)}
    AND "PullRequest"."workspaceId" = ${filters.workspaceId}
    ${teamFilter}
    ${repoFilter}
  GROUP BY
    CR_Author."id", PR_Author."id";
`;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    CodeReviewDistributionRow[]
  >(query);

  const { entities, links, totalReviews } = processCodeReviewDistributionRows(
    results.map((result) => ({ ...result, value: Number(result.value) }))
  );

  return {
    entities,
    links,
    totalReviews,
  };
};

// ---- Team Overview ----

interface CodeReviewTeamOverviewRow {
  team_id: number | null;
  team_name: string;
  team_icon: string;
  avg_time_to_first_review: number;
  avg_time_to_approval: number;
  prs_without_approval: bigint;
}

export const getCodeReviewTeamOverview = async (
  filters: Omit<PullRequestFlowChartFilters, "period">
) => {
  const { joins, conditions } = buildCodeReviewFilters(
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
        AVG(pt."timeToFirstReview") AS avg_time_to_first_review,
        AVG(
          CASE WHEN pt."firstApprovalAt" IS NOT NULL AND pt."firstReviewAt" IS NOT NULL
            THEN EXTRACT(EPOCH FROM (pt."firstApprovalAt" - pt."firstReviewAt")) * 1000
          END
        ) AS avg_time_to_approval,
        COUNT(*) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 FROM "CodeReview" cr
            WHERE cr."pullRequestId" = p."id"
            AND cr."state" = 'APPROVED'::"CodeReviewState"
          )
        ) AS prs_without_approval
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
        pt."timeToFirstReview",
        pt."firstApprovalAt",
        pt."firstReviewAt",
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
        AVG(ppt."timeToFirstReview") AS avg_time_to_first_review,
        AVG(
          CASE WHEN ppt."firstApprovalAt" IS NOT NULL AND ppt."firstReviewAt" IS NOT NULL
            THEN EXTRACT(EPOCH FROM (ppt."firstApprovalAt" - ppt."firstReviewAt")) * 1000
          END
        ) AS avg_time_to_approval,
        COUNT(*) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 FROM "CodeReview" cr
            WHERE cr."pullRequestId" = ppt.pr_id
            AND cr."state" = 'APPROVED'::"CodeReviewState"
          )
        ) AS prs_without_approval
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
    CodeReviewTeamOverviewRow[]
  >(query);

  return results.map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    teamIcon: r.team_icon,
    avgTimeToFirstReview: BigInt(
      Math.floor(Number(r.avg_time_to_first_review) || 0)
    ),
    avgTimeToApproval: BigInt(Math.floor(Number(r.avg_time_to_approval) || 0)),
    prsWithoutApproval: Number(r.prs_without_approval),
  }));
};
