import { Prisma, PullRequestSize } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc } from "./chart.service";
import { Period } from "@sweetr/graphql-types/dist/api";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";

interface ChartFilters {
  workspaceId: number;
  startDate: string;
  endDate: string;
  period: Period;
  teamId?: number;
}

export const getTimeToMergeChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
  period,
}: ChartFilters) => {
  const query = Prisma.sql`
    SELECT DATE_TRUNC(${periodToDateTrunc(period)}, p."mergedAt") AS period,
    AVG(pt."timeToMerge") AS value
    FROM "PullRequestTracking" pt
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
    WHERE p."mergedAt" >= ${startDate} 
      AND p."mergedAt" <= ${endDate} 
      AND p."mergedAt" IS NOT NULL
      AND tm."teamId" = ${teamId}
      AND wm."workspaceId" = ${workspaceId}
    GROUP BY period
    ORDER BY period ASC;
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
}: ChartFilters) => {
  const query = Prisma.sql`
    SELECT DATE_TRUNC(${periodToDateTrunc(
      period
    )}, pt."firstReviewAt") AS period,
    AVG(pt."timeToFirstReview") AS value
    FROM "PullRequestTracking" pt
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
    WHERE pt."firstReviewAt" >= ${startDate} 
      AND pt."firstReviewAt" <= ${endDate} 
      AND pt."firstReviewAt" IS NOT NULL
      AND tm."teamId" = ${teamId}
      AND wm."workspaceId" = ${workspaceId}
    GROUP BY period
    ORDER BY period ASC;
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
}: ChartFilters) => {
  const query = Prisma.sql`
    SELECT DATE_TRUNC(${periodToDateTrunc(
      period
    )}, pt."firstApprovalAt") AS period,
    AVG(pt."timeToFirstApproval") AS value
    FROM "PullRequestTracking" pt
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
    WHERE pt."firstApprovalAt" >= ${startDate} 
      AND pt."firstApprovalAt" <= ${endDate} 
      AND pt."firstApprovalAt" IS NOT NULL
      AND tm."teamId" = ${teamId}
      AND wm."workspaceId" = ${workspaceId}
    GROUP BY period
    ORDER BY period ASC;
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
}: ChartFilters) => {
  const query = Prisma.sql`
    SELECT DATE_TRUNC(${periodToDateTrunc(period)}, p."mergedAt") AS period,
    AVG(pt."cycleTime") AS value
    FROM "PullRequestTracking" pt
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
    WHERE p."mergedAt" >= ${startDate} 
      AND p."mergedAt" <= ${endDate} 
      AND p."mergedAt" IS NOT NULL
      AND tm."teamId" = ${teamId}
      AND wm."workspaceId" = ${workspaceId}
    GROUP BY period
    ORDER BY period ASC;
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
}: ChartFilters) => {
  const query = Prisma.sql`
    SELECT DATE_TRUNC(${periodToDateTrunc(period)}, p."mergedAt") AS period,
    pt.size AS size,
    COUNT(p."id") AS value
    FROM "PullRequestTracking" pt
    JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    JOIN "Repository" r ON p."repositoryId" = r."id"
    JOIN "GitProfile" gp ON p."authorId" = gp."id"
    JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
    WHERE p."mergedAt" >= ${startDate} 
      AND p."mergedAt" <= ${endDate} 
      AND p."mergedAt" IS NOT NULL
      AND tm."teamId" = ${teamId}
      AND r."workspaceId" = ${workspaceId}
    GROUP BY period, size
    ORDER BY period ASC;
  `;

  const results =
    await getPrisma(workspaceId).$queryRaw<
      { period: Date; size: PullRequestSize; value: number }[]
    >(query);

  const columns = [
    ...new Set(results.map((result) => result.period.toISOString())),
  ];

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
    columns: [...new Set(results.map((result) => result.period.toISOString()))],
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
