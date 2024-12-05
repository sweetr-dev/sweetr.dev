import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { sort, sum } from "radash";
import { roundDecimalPoints } from "../../../lib/number";
import {
  CodeReviewChartFilters,
  CodeReviewDistributionRow,
  CodeReviewLink,
} from "./chart-code-review.types";

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

export const processCodeReviewDistributionRows = (
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

  // Sum review count for repeated source-targets and remove duplicates
  links.forEach((link) => {
    const key = `${link.source}-${link.target}`;
    const existingLink = combinedLinksMap.get(key);

    if (existingLink) {
      existingLink.value += link.value; // Sum the values
      return;
    }

    combinedLinksMap.set(key, { ...link });
  });

  // Convert the map back to an array
  const combinedLinks: CodeReviewLink[] = Array.from(combinedLinksMap.values());

  // Expands the rows into tuples for code reviewers and PR author, then flat it back to an array
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
