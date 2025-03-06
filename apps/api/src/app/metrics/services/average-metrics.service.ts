import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { AverageMetricFilters } from "./average-metrics.types";

const innerJoinClause = Prisma.sql`
    INNER JOIN "PullRequest" p ON pt."pullRequestId" = p."id"
    INNER JOIN "GitProfile" gp ON p."authorId" = gp."id"
    INNER JOIN "TeamMember" tm ON gp."id" = tm."gitProfileId"
    INNER JOIN "WorkspaceMembership" wm ON gp."id" = wm."gitProfileId"
`;

export const getAverageTimeToMerge = async (filters: AverageMetricFilters) => {
  const query = Prisma.sql`
    SELECT AVG(pt."timeToMerge") AS value
    FROM "PullRequestTracking" pt
    ${innerJoinClause}
    WHERE p."mergedAt" >= ${new Date(filters.startDate)} 
      AND p."mergedAt" <= ${new Date(filters.endDate)} 
      AND p."mergedAt" IS NOT NULL
      AND tm."teamId" = ${filters.teamId}
      AND wm."workspaceId" = ${filters.workspaceId}
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: number }[]
  >(query);

  return results.at(0)?.value || 0;
};

export const getAverageTimeForFirstReview = async (
  filters: AverageMetricFilters
) => {
  const query = Prisma.sql`
    SELECT AVG(pt."timeToFirstReview") AS value
    FROM "PullRequestTracking" pt
    ${innerJoinClause}
    WHERE pt."firstReviewAt" >= ${new Date(filters.startDate)} 
      AND pt."firstReviewAt" <= ${new Date(filters.endDate)} 
      AND pt."firstReviewAt" IS NOT NULL
      AND tm."teamId" = ${filters.teamId}
      AND wm."workspaceId" = ${filters.workspaceId}
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: number }[]
  >(query);

  return results.at(0)?.value || 0;
};

export const getAverageTimeForApproval = async (
  filters: AverageMetricFilters
) => {
  const query = Prisma.sql`
    SELECT  AVG(pt."timeToFirstApproval") AS value
    FROM "PullRequestTracking" pt
    ${innerJoinClause}
    WHERE pt."firstApprovalAt" >= ${new Date(filters.startDate)} 
      AND pt."firstApprovalAt" <= ${new Date(filters.endDate)} 
      AND pt."firstApprovalAt" IS NOT NULL
      AND tm."teamId" = ${filters.teamId}
      AND wm."workspaceId" = ${filters.workspaceId}
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: number }[]
  >(query);

  return results.at(0)?.value || 0;
};

export const getAverageCycleTime = async (filters: AverageMetricFilters) => {
  const query = Prisma.sql`
    SELECT AVG(pt."cycleTime") AS value
    FROM "PullRequestTracking" pt
    ${innerJoinClause}
    WHERE p."mergedAt" >= ${new Date(filters.startDate)}
      AND p."mergedAt" <= ${new Date(filters.endDate)}
      AND p."mergedAt" IS NOT NULL
      AND tm."teamId" = ${filters.teamId}
      AND wm."workspaceId" = ${filters.workspaceId}
  `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: number }[]
  >(query);

  return results.at(0)?.value || 0;
};

export const getAveragePullRequestSize = async (
  filters: AverageMetricFilters
) => {
  const query = Prisma.sql`
      SELECT AVG(pt."linesAddedCount" + pt."linesDeletedCount") AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE p."mergedAt" >= ${new Date(filters.startDate)}
        AND p."mergedAt" <= ${new Date(filters.endDate)}
        AND p."mergedAt" IS NOT NULL
        AND tm."teamId" = ${filters.teamId}
        AND wm."workspaceId" = ${filters.workspaceId}
    `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: number }[]
  >(query);

  return results.at(0)?.value || 0;
};

export const getPullRequestCount = async (filters: AverageMetricFilters) => {
  const query = Prisma.sql`
      SELECT COUNT(*) AS value
      FROM "PullRequestTracking" pt
      ${innerJoinClause}
      WHERE p."mergedAt" >= ${new Date(filters.startDate)}
        AND p."mergedAt" <= ${new Date(filters.endDate)}
        AND p."mergedAt" IS NOT NULL
        AND tm."teamId" = ${filters.teamId}
        AND wm."workspaceId" = ${filters.workspaceId}
    `;

  const results = await getPrisma(filters.workspaceId).$queryRaw<
    { value: bigint }[]
  >(query);

  const value = results.at(0)?.value || 0n;

  return Number(value);
};
