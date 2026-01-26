import { Prisma } from "@prisma/client";
import { getPreviousPeriod } from "../../../lib/date";
import { getPrisma } from "../../../prisma";
import { DoraMetricsFilters } from "./dora-metrics.types";
import {
  BreakdownAggregateQueryArgs,
  BreakdownRow,
  GetLeadTimeBreakdownArgs,
  LeadTimeBreakdownResult,
  StageResult,
} from "./lead-time-breakdown.types";

export const getLeadTimeBreakdown = async (
  args: GetLeadTimeBreakdownArgs
): Promise<LeadTimeBreakdownResult> => {
  const { workspaceId, dateRange } = args;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const currentQuery = buildBreakdownAggregateQuery({
    args,
    from,
    to,
  });

  const previousQuery = buildBreakdownAggregateQuery({
    args,
    from: beforeFrom,
    to: beforeTo,
  });

  const [currentResults, previousResults] = await Promise.all([
    getPrisma(workspaceId).$queryRaw<BreakdownRow[]>(currentQuery),
    getPrisma(workspaceId).$queryRaw<BreakdownRow[]>(previousQuery),
  ]);

  const current = currentResults[0] || {};
  const previous = previousResults[0] || {};

  return {
    codingTime: buildStage(current.timeToCode, previous.timeToCode),
    timeToFirstReview: buildStage(
      current.timeToFirstReview,
      previous.timeToFirstReview
    ),
    timeToApprove: buildStage(
      current.timeToFirstApproval,
      previous.timeToFirstApproval
    ),
    timeToMerge: buildStage(current.timeToMerge, previous.timeToMerge),
    timeToDeploy: buildStage(current.timeToDeploy, previous.timeToDeploy),
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildStage = (
  currentValue: number | null | undefined,
  previousValue: number | null | undefined
): StageResult => {
  const currentAmount = Math.floor(currentValue || 0);
  const previousAmount = Math.floor(previousValue || 0);

  return {
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change: calculateChange(currentAmount, previousAmount),
  };
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;

  return ((current - previous) / previous) * 100;
};

const buildBreakdownAggregateQuery = ({
  args,
  from,
  to,
}: BreakdownAggregateQueryArgs): Prisma.Sql => {
  const { joins, conditions } = buildDeploymentQueryFilters(args, "d");

  const allJoins = [
    ...joins,
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId"`,
  ];

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`
  );

  const whereClause = Prisma.join(conditions, " AND ");
  const joinClause = Prisma.join(allJoins, " ");

  return Prisma.sql`
    SELECT 
      AVG(prt."timeToCode") AS "timeToCode",
      AVG(prt."timeToFirstReview" - prt."timeToCode") AS "timeToFirstReview",
      AVG(prt."timeToFirstApproval" - prt."timeToFirstReview") AS "timeToFirstApproval",
      AVG(prt."timeToMerge") AS "timeToMerge",
      AVG(prt."timeToDeploy") AS "timeToDeploy"
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
};

const buildDeploymentQueryFilters = (
  filters: DoraMetricsFilters,
  alias: string
) => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  conditions.push(
    Prisma.sql`${Prisma.raw(alias)}."workspaceId" = ${filters.workspaceId}`
  );

  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = ${Prisma.raw(alias)}."environmentId" AND e."workspaceId" = ${Prisma.raw(alias)}."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  const needsApplicationJoin =
    (filters.teamIds && filters.teamIds.length > 0) ||
    (filters.repositoryIds && filters.repositoryIds.length > 0);

  if (needsApplicationJoin) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = ${Prisma.raw(alias)}."applicationId" AND a."workspaceId" = ${Prisma.raw(alias)}."workspaceId" AND a."archivedAt" IS NULL`
    );

    if (filters.teamIds && filters.teamIds.length > 0) {
      conditions.push(
        Prisma.sql`a."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      );
    }

    if (filters.repositoryIds && filters.repositoryIds.length > 0) {
      conditions.push(
        Prisma.sql`a."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      );
    }
  }

  return { joins, conditions };
};
