import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import {
  CodeReviewChartFilters,
  CodeReviewDistributionRow,
} from "./chart-code-review.types";
import { processCodeReviewDistributionRows } from "./chart-code-review-efficiency.service";

export const getCodeReviewDistributionChartData = async ({
  workspaceId,
  teamId,
  startDate,
  endDate,
}: CodeReviewChartFilters) => {
  const query = Prisma.sql`
  SELECT
    CONCAT('cr-author:', CR_Author."handle") AS source,
    CONCAT(PR_Author."handle", ':', CR_Author."name", ':', CASE WHEN PR_TeamMember."id" IS NOT NULL THEN 'internal' ELSE 'external' END) AS target,
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
  JOIN 
    "TeamMember" AS CR_TeamMember ON CR_Author."id" = CR_TeamMember."gitProfileId"
  LEFT JOIN 
    "TeamMember" AS PR_TeamMember ON PR_Author."id" = PR_TeamMember."gitProfileId" AND PR_TeamMember."teamId" = ${teamId}
  JOIN 
    "WorkspaceMembership" as CR_Member ON CR_Author."id" = CR_Member."gitProfileId"
  JOIN 
    "WorkspaceMembership" as PR_Member ON PR_Author."id" = PR_Member."gitProfileId"
  WHERE 
    "CodeReview"."createdAt" >= ${startDate} 
    AND "CodeReview"."createdAt" <= ${endDate} 
    AND CR_TeamMember."teamId" = ${teamId}
    AND CR_Member."workspaceId" = ${workspaceId}
    AND PR_Member."workspaceId" = ${workspaceId}
  GROUP BY
    CR_Author."id", PR_Author."id", PR_TeamMember."id";
`;

  const results =
    await getPrisma(workspaceId).$queryRaw<CodeReviewDistributionRow[]>(query);

  const { entities, links, totalReviews } = processCodeReviewDistributionRows(
    results.map((result) => ({ ...result, value: Number(result.value) }))
  );

  return {
    entities,
    links,
    totalReviews,
  };
};

export { processCodeReviewDistributionRows, getWorkspaceCodeReviewDistributionChartData } from "./chart-code-review-efficiency.service";
