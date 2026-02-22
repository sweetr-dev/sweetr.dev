import { getPrisma } from "../../../prisma";
import { Prisma } from "@prisma/client";

export const getPersonalMetrics = async (
  workspaceId: number,
  personId: number
) => {
  const codeReviewMetrics = await getCodeReviewMetrics(workspaceId, personId);
  const pullRequestSizeMetrics = await getPullRequestSizeMetrics(
    workspaceId,
    personId
  );

  return {
    codeReviewAmount: codeReviewMetrics,
    pullRequestSize: pullRequestSizeMetrics,
  };
};

const getCodeReviewMetrics = async (workspaceId: number, personId: number) => {
  const result = await getPrisma(workspaceId).$queryRaw<
    {
      current: bigint;
      previous: bigint;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (
        WHERE "CodeReview"."createdAt" BETWEEN NOW() - INTERVAL '30 days' AND NOW() 
        AND "CodeReview"."workspaceId" = ${workspaceId}
      ) AS current,
      COUNT(*) FILTER (
        WHERE "CodeReview"."createdAt" BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' 
        AND "CodeReview"."workspaceId" = ${workspaceId}
      ) AS previous
    FROM
      "CodeReview"
    JOIN
      "GitProfile" ON "CodeReview"."authorId" = "GitProfile"."id"
    JOIN 
      "WorkspaceMembership" ON "GitProfile"."id" = "WorkspaceMembership"."gitProfileId"
    WHERE
      "WorkspaceMembership"."workspaceId" = ${workspaceId} AND 
      "CodeReview"."authorId" = ${personId};
    `);

  const data = result.at(0);

  if (!data) {
    return {
      current: 0,
      previous: 0,
      change: 0,
    };
  }

  const current = Number(data.current);
  const previous = Number(data.previous);

  return {
    current: current,
    previous: previous,
    change: Math.floor(((current - previous) / (previous || 1)) * 100),
  };
};

const getPullRequestSizeMetrics = async (
  workspaceId: number,
  personId: number
) => {
  const result = await getPrisma(workspaceId).$queryRaw<
    {
      current_small: bigint;
      current: bigint;
      previous: bigint;
      previous_small: bigint;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (
        WHERE "PullRequest"."mergedAt" BETWEEN NOW() - INTERVAL '30 days' AND NOW() 
        AND "PullRequest"."workspaceId" = ${workspaceId}
      ) AS current,
      COUNT(*) FILTER (
        WHERE "PullRequest"."mergedAt" BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' 
        AND "PullRequest"."workspaceId" = ${workspaceId}
      ) AS previous,
      COUNT(*) FILTER (
        WHERE "PullRequestTracking"."size" IN ('TINY', 'SMALL') AND "PullRequest"."mergedAt" BETWEEN NOW() - INTERVAL '30 days' AND NOW() 
        AND "PullRequest"."workspaceId" = ${workspaceId}
      ) AS current_small,
      COUNT(*) FILTER (
        WHERE "PullRequestTracking"."size" IN ('TINY', 'SMALL') AND "PullRequest"."mergedAt" BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' 
        AND "PullRequest"."workspaceId" = ${workspaceId}
      ) AS previous_small
    FROM
      "PullRequest"
    JOIN
      "GitProfile" ON "PullRequest"."authorId" = "GitProfile"."id"
    JOIN 
      "WorkspaceMembership" ON "GitProfile"."id" = "WorkspaceMembership"."gitProfileId"
    JOIN 
      "PullRequestTracking" ON "PullRequest"."id" = "PullRequestTracking"."pullRequestId"
    WHERE
      "PullRequest"."mergedAt" IS NOT NULL AND
      "WorkspaceMembership"."workspaceId" = ${workspaceId} AND 
      "PullRequest"."authorId" = ${personId};
    `);

  const data = result.at(0);

  if (!data) {
    return {
      current: 0,
      previous: 0,
      change: 0,
    };
  }

  const current =
    (Number(data.current_small) * 100) / Number(data.current || 1);
  const previous =
    (Number(data.previous_small) * 100) / Number(data.previous || 1);

  return {
    current: Math.floor(current),
    previous: Math.floor(previous),
    change: Math.floor(current) - Math.floor(previous),
  };
};
