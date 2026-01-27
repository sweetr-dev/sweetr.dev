import { Prisma } from "@prisma/client";
import { getPreviousPeriod } from "../../../lib/date";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import {
  AggregateQueryArgs,
  DeploymentFiltersResult,
  DeploymentFrequencyResult,
  DoraMetricsFilters,
  FailureRateResult,
  MetricResult,
} from "./dora-metrics.types";

export const getLeadTimeMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId"`,
  ];

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(allJoins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, deployment_lead_times."deployedAt") AS period,
        AVG(deployment_lead_times.lead_time_ms) AS value
      FROM (
        SELECT 
          d."id",
          d."deployedAt",
          EXTRACT(EPOCH FROM (d."deployedAt" - MIN(COALESCE(prt."firstCommitAt", pr."createdAt")))) * 1000 AS lead_time_ms
        FROM "Deployment" d
        ${chartJoinClause}
        WHERE ${chartWhereClause}
        GROUP BY d."id", d."deployedAt"
      ) AS deployment_lead_times
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const currentAmountQuery = buildLeadTimeAggregateQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildLeadTimeAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      chartQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(Math.floor(r.value || 0)));

  const currentAmount = amountResult[0]?.value
    ? Math.floor(amountResult[0].value)
    : 0;
  const previousAmount = beforeResult[0]?.value
    ? Math.floor(beforeResult[0].value)
    : 0;
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildDeploymentFilters = (
  filters: DoraMetricsFilters,
  alias: string = "d"
): DeploymentFiltersResult => {
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

const buildLeadTimeAggregateQuery = ({
  filters,
  from,
  to,
}: AggregateQueryArgs): Prisma.Sql => {
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

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
    SELECT AVG(deployment_lead_times.lead_time_ms) AS value
    FROM (
      SELECT 
        d."id",
        EXTRACT(EPOCH FROM (d."deployedAt" - MIN(COALESCE(prt."firstCommitAt", pr."createdAt")))) * 1000 AS lead_time_ms
      FROM "Deployment" d
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY d."id", d."deployedAt"
    ) AS deployment_lead_times;
  `;
};

const buildChangeFailureRateAggregateQuery = ({
  filters,
  from,
  to,
}: AggregateQueryArgs): Prisma.Sql => {
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

  const allJoins = [
    ...joins,
    Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"`,
  ];

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`
  );

  const whereClause = Prisma.join(conditions, " AND ");
  const joinClause = Prisma.join(allJoins, " ");

  return Prisma.sql`
    SELECT ROUND(
      (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT d."id"), 0)::numeric) * 100,
      2
    )::double precision AS value
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
};

export const getChangeFailureRateMetric = async (
  filters: DoraMetricsFilters
): Promise<FailureRateResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"`,
  ];

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(allJoins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, d."deployedAt") AS period,
        ROUND(
          (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT d."id"), 0)::numeric) * 100,
          2
        )::double precision AS value
      FROM "Deployment" d
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const currentAmountQuery = buildChangeFailureRateAggregateQuery({
    filters,
    from,
    to,
  });
  const previousAmountQuery = buildChangeFailureRateAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<
      { period: Date; value: number | null }[]
    >(chartQuery),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => parseFloat(r.value?.toFixed(2) || "0"));

  const currentAmount = amountResult[0]?.value || 0;
  const previousAmount = beforeResult[0]?.value || 0;

  // Failure rate is already a percentage, so use the difference in percentage points
  const change = currentAmount - previousAmount;

  return {
    columns,
    data,
    currentAmount,
    previousAmount,
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildDeploymentFrequencyAggregateQuery = ({
  filters,
  from,
  to,
}: AggregateQueryArgs): Prisma.Sql => {
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`
  );

  const whereClause = Prisma.join(conditions, " AND ");
  const joinClause = joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

  return Prisma.sql`
    SELECT COUNT(*)::bigint AS value
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
};

export const getDeploymentFrequencyMetric = async (
  filters: DoraMetricsFilters
): Promise<DeploymentFrequencyResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause =
    joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, d."deployedAt") AS period,
        COUNT(*)::bigint AS value
      FROM "Deployment" d
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const currentAmountQuery = buildDeploymentFrequencyAggregateQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildDeploymentFrequencyAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<{ period: Date; value: bigint }[]>(
      chartQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: bigint }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: bigint }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(r.value || 0));

  const currentAmount = Number(amountResult[0]?.value || 0);
  const previousAmount = Number(beforeResult[0]?.value || 0);
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const daysDiff = Math.max(
    1,
    Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avg = currentAmount / daysDiff;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    avg,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildIncidentFilters = (
  filters: DoraMetricsFilters
): DeploymentFiltersResult => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  conditions.push(Prisma.sql`i."workspaceId" = ${filters.workspaceId}`);
  conditions.push(Prisma.sql`i."resolvedAt" IS NOT NULL`);

  joins.push(
    Prisma.sql`INNER JOIN "Deployment" cd ON i."causeDeploymentId" = cd."id" AND cd."workspaceId" = i."workspaceId"`
  );

  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = cd."environmentId" AND e."workspaceId" = cd."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  // Team filter can match via incident.teamId or application.teamId
  const needsApplicationJoin =
    (filters.teamIds && filters.teamIds.length > 0) ||
    (filters.repositoryIds && filters.repositoryIds.length > 0);

  if (needsApplicationJoin) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = cd."applicationId" AND a."workspaceId" = cd."workspaceId" AND a."archivedAt" IS NULL`
    );

    if (filters.teamIds && filters.teamIds.length > 0) {
      conditions.push(
        Prisma.sql`(
          i."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
          OR a."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
        )`
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
  } else if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`i."teamId" = ANY(ARRAY[${Prisma.join(
        filters.teamIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  return { joins, conditions };
};

const buildMeanTimeToRecoverAggregateQuery = ({
  filters,
  from,
  to,
}: AggregateQueryArgs): Prisma.Sql => {
  const { joins, conditions } = buildIncidentFilters(filters);

  conditions.push(
    Prisma.sql`i."detectedAt" >= ${new Date(from)}`,
    Prisma.sql`i."detectedAt" <= ${new Date(to)}`,
    Prisma.sql`i."archivedAt" IS NULL`
  );

  const whereClause = Prisma.join(conditions, " AND ");
  const joinClause = Prisma.join(joins, " ");

  return Prisma.sql`
    SELECT AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS value
    FROM "Incident" i
    ${joinClause}
    WHERE ${whereClause};
  `;
};

export const getMeanTimeToRecoverMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildIncidentFilters(filters);
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const chartConditions = [
    ...conditions,
    Prisma.sql`i."detectedAt" >= ${new Date(from)}`,
    Prisma.sql`i."detectedAt" <= ${new Date(to)}`,
    Prisma.sql`i."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(joins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, i."detectedAt") AS period,
        AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS value
      FROM "Incident" i
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const currentAmountQuery = buildMeanTimeToRecoverAggregateQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildMeanTimeToRecoverAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<
      { period: Date; value: number | null }[]
    >(chartQuery),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(Math.floor(r.value || 0)));

  const currentAmount = amountResult[0]?.value
    ? Math.floor(amountResult[0].value)
    : 0;
  const previousAmount = beforeResult[0]?.value
    ? Math.floor(beforeResult[0].value)
    : 0;
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};
